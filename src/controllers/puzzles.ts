import express from "express";
import { getRandomPuzzles, getPuzzleByPuzzleId } from "../db/puzzles";
import { redisClient } from "../helpers";

const NUM_PUZZLES = "num_puzzles";

const refreshCache = async () => {
  const puzzles = await getRandomPuzzles(1000);
  const multi = redisClient.multi();
  puzzles.map((puzzle, idx) => {
    multi.set(`puzzle:${idx}`, JSON.stringify(puzzle));
  });

  multi.set(NUM_PUZZLES, puzzles.length);
  await multi.exec();
};

export const getARandomPuzzle = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const cacheData = await redisClient.get(NUM_PUZZLES);

    if (cacheData) {
      const randomPuzzleIdx = Math.floor(Math.random() * parseInt(cacheData));
      const randomPuzzleData = await redisClient.get(
        `puzzle:${randomPuzzleIdx}`
      );
      if (randomPuzzleData) {
        const randomPuzzle = JSON.parse(randomPuzzleData);
        return res.status(200).json(randomPuzzle);
      }
    }

    // If cache is empty, refresh it and try again
    await refreshCache();
    const refreshedCacheData = await redisClient.get(NUM_PUZZLES);
    if (refreshedCacheData) {
      const randomPuzzleIdx = Math.floor(
        Math.random() * parseInt(refreshedCacheData)
      );
      const randomPuzzleData = await redisClient.get(
        `puzzle:${randomPuzzleIdx}`
      );
      if (randomPuzzleData) {
        const randomPuzzle = JSON.parse(randomPuzzleData);
        return res.status(200).json(randomPuzzle);
      }
    }

    // If all fails, just fetch a random puzzle from the database
    const randomPuzzle = await getRandomPuzzles(1);
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
