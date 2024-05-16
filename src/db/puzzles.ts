import mongoose from "mongoose";

// Puzzle Config
const PuzzleSchema = new mongoose.Schema(
  {
    PuzzleId: { type: String, required: true },
    FEN: { type: String, required: true },
    Moves: { type: String, required: true },
    Rating: { type: Number, required: true },
    RatingDeviation: { type: Number, required: true },
    Popularity: { type: Number, required: true },
    NbPlays: { type: Number, required: true },
    Themes: { type: String, required: true },
    GameUrl: { type: String, required: true },
    OpeningTags: { type: String, required: false },
  },
  { collection: "lichess_puzzles" }
);

export const PuzzleModel = mongoose.model("Puzzle", PuzzleSchema);

// Puzzle Actions
export const getAllPuzzles = () => PuzzleModel.find();

export const getRandomPuzzles = async (count: number) => {
  const randomPuzzles = await PuzzleModel.aggregate([
    { $sample: { size: count } },
  ]);
  return randomPuzzles;
};

export const getPuzzleByPuzzleId = (PuzzleId: string) =>
  PuzzleModel.findOne({ PuzzleId });
