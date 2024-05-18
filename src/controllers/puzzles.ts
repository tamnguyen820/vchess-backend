import express from "express";
import { getPuzzleByPuzzleId, getRandomPuzzles } from "../db/puzzles";
import { redisClient } from "../helpers";

const PUZZLE_IDS_KEY = "puzzle_ids";

const refreshCache = async () => {
  try {
    const puzzles = await getRandomPuzzles(1000);
    const multi = redisClient.multi();

    const puzzleIds = puzzles.map((puzzle) => {
      const puzzleId = puzzle._id.toString();
      multi.set(`puzzle:${puzzleId}`, JSON.stringify(puzzle));
      return puzzleId;
    });

    multi.set(PUZZLE_IDS_KEY, JSON.stringify(puzzleIds));
    await multi.exec();
  } catch (error) {
    console.error("Error refreshing cache:", error);
  }
};

const getRandomPuzzleFromCache = async () => {
  const cacheData = await redisClient.get(PUZZLE_IDS_KEY);

  if (cacheData) {
    const puzzleIds = JSON.parse(cacheData);
    const randomPuzzleId =
      puzzleIds[Math.floor(Math.random() * puzzleIds.length)];
    const randomPuzzleData = await redisClient.get(`puzzle:${randomPuzzleId}`);
    if (randomPuzzleData) {
      return JSON.parse(randomPuzzleData);
    }
  }
  return null;
};

export const getARandomPuzzle = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let randomPuzzle = await getRandomPuzzleFromCache();

    if (!randomPuzzle) {
      await refreshCache();
      randomPuzzle = await getRandomPuzzleFromCache();
    }

    if (randomPuzzle) {
      return res.status(200).json(randomPuzzle);
    }

    // If all else fails, fetch a random puzzle directly from the database
    const [dbRandomPuzzle] = await getRandomPuzzles(1);
    return res.status(200).json(dbRandomPuzzle);
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
    const cachedPuzzle = await redisClient.get(`puzzle:${id}`);
    if (cachedPuzzle) {
      return res.status(200).json(JSON.parse(cachedPuzzle));
    }
    // If not in cache, fetch from the database
    const puzzle = await getPuzzleByPuzzleId(id);
    if (!puzzle) {
      return res.sendStatus(400);
    }

    // Cache the puzzle for future requests
    await redisClient.set(`puzzle:${id}`, JSON.stringify(puzzle));
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
