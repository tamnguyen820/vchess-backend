import express from "express";
import {
  getAllPuzzles,
  getRandomPuzzle,
  getPuzzleByPuzzleId,
} from "../db/puzzles";
import { redisClient } from "../helpers";

const CACHE_KEY = "all_puzzles";

const refreshCache = async () => {
  const puzzles = await getAllPuzzles(); // Fetch all puzzles
  await redisClient.setEx(CACHE_KEY, 3600, JSON.stringify(puzzles)); // Cache for 1 hour
};

export const getARandomPuzzle = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const cacheData = await redisClient.get(CACHE_KEY);

    if (cacheData) {
      const puzzles = JSON.parse(cacheData);
      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      return res.status(200).json(randomPuzzle);
    }

    // If cache is empty, refresh it and try again
    await refreshCache();
    const refreshedCacheData = await redisClient.get(CACHE_KEY);
    if (refreshedCacheData) {
      const puzzles = JSON.parse(refreshedCacheData);
      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      return res.status(200).json(randomPuzzle);
    }

    // If all fails, just fetch a random puzzle from the database
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

// Initial cache refresh when server starts
refreshCache().catch(console.error);

// Refresh cache every hour
setInterval(refreshCache, 3600000);
