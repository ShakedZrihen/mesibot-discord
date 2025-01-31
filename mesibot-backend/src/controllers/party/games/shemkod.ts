import { Router } from "express";
import { wordsPull } from "./resources/words-pull";

export const semkodRouter = Router();

semkodRouter.get("/start", async (req, res) => {
  try {
    // Shuffle words and pick 25 random ones
    const shuffledWords = wordsPull.sort(() => Math.random() - 0.5).slice(0, 25);

    // Assign words to groups
    const group1 = shuffledWords.slice(0, 9).map((word) => ({ word, group: 1 }));
    const group2 = shuffledWords.slice(9, 17).map((word) => ({ word, group: 2 }));
    const neutral = shuffledWords.slice(17).map((word) => ({ word, group: "neutral" }));

    // Combine all words
    const boardWords = [...group1, ...group2, ...neutral];

    // Shuffle again before placing them on the board
    const shuffledBoard = boardWords.sort(() => Math.random() - 0.5);

    // Create 5x5 board
    const board = [];
    for (let i = 0; i < 5; i++) {
      board.push(shuffledBoard.slice(i * 5, (i + 1) * 5));
    }

    // Return the board
    res.status(200).json({ board });
  } catch (error) {
    console.error("Error generating the board:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
