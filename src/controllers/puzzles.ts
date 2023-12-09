import express from "express";
import { getRandomPuzzle, getPuzzleByPuzzleId } from "../db/puzzles";

export const getARandomPuzzle = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const randomPuzzle = await getRandomPuzzle();
    return res.status(200).json(randomPuzzle);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const getPuzzleById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const puzzle = await getPuzzleByPuzzleId(id);
    if (!puzzle) {
      return res.sendStatus(400);
    }
    return res.status(200).json(puzzle);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
