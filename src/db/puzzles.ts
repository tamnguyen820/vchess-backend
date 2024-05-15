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

export const getRandomPuzzle = async () => {
  const randomPuzzle = await PuzzleModel.aggregate([{ $sample: { size: 1 } }]);
  return randomPuzzle[0];
};

export const getPuzzleByPuzzleId = (PuzzleId: string) =>
  PuzzleModel.findOne({ PuzzleId });
