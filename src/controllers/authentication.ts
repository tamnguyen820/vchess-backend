import express from "express";
import {
  getUserByEmail,
  getUserByUsername,
  createUser,
  getUserBySessionToken,
} from "../db/users";
import { getHash, random } from "../helpers";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      throw new Error("Empty email, password, or username");
    }

    const emailInUse = await getUserByEmail(email);
    if (emailInUse) {
      throw new Error("Email already in use");
    }
    const usernameInUse = await getUserByUsername(username);
    if (usernameInUse) {
      throw new Error("Username already in use");
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: getHash(salt, password),
      },
    });

    return res.status(201).json(user).end();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message }).end();
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Empty email or password");
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );
    if (!user) {
      throw new Error("Cannot find user");
    }

    const expectedHash = getHash(user.authentication.salt, password);
    if (user.authentication.password !== expectedHash) {
      throw new Error("Wrong password");
    }

    user.authentication.sessionToken = getHash(random(), user._id.toString());
    await user.save();

    res.cookie(process.env.TOKEN_NAME, user.authentication.sessionToken, {
      domain: process.env.DOMAIN || "localhost",
      path: "/",
    });

    return res.status(200).json(user).end();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message }).end();
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    const sessionToken = req.cookies[process.env.TOKEN_NAME];
    if (!sessionToken) {
      throw new Error("No session token in cookies");
    }

    const user = await getUserBySessionToken(sessionToken);
    if (!user) {
      throw new Error("No user with such session token");
    }

    user.authentication.sessionToken = "";
    res.clearCookie(process.env.TOKEN_NAME);

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message }).end();
  }
};
