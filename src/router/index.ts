import express from "express";
import health from "./health";
import authentication from "./authentication";
import users from "./users";
import puzzles from "./puzzles";

const router = express.Router();

export default (): express.Router => {
  health(router);
  authentication(router);
  users(router);
  puzzles(router);
  return router;
};
