import express from "express";
import { getARandomPuzzle, getPuzzleById } from "../controllers/puzzles";

export default (router: express.Router) => {
  router.get("/puzzles/random", getARandomPuzzle);
  router.get("/puzzles/:id", getPuzzleById);
};
