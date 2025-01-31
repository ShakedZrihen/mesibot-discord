import { Router } from "express";
import { wordsPull } from "./resources/words-pull";
import { Party } from "../../../models/Party";

const generateBoard = (currentRound: number) => {
  // Shuffle words and pick 25 random ones
  const shuffledWords = wordsPull.sort(() => Math.random() - 0.5).slice(0, 25);

  // Randomly decide which group gets 9 cards
  const groupStarts = Math.random() < 0.5 ? 1 : 2;

  // Assign words to groups with isOpen attribute
  const firstGroup = shuffledWords.slice(0, 9).map((word) => ({ word, group: groupStarts, isOpen: false }));
  const secondGroup = shuffledWords
    .slice(9, 17)
    .map((word) => ({ word, group: groupStarts === 1 ? 2 : 1, isOpen: false }));
  const neutral = shuffledWords.slice(17).map((word) => ({ word, group: "neutral", isOpen: false }));

  // Combine all words and shuffle
  const boardWords = [...firstGroup, ...secondGroup, ...neutral].sort(() => Math.random() - 0.5);

  // Create 5x5 board
  const board = [];
  for (let i = 0; i < 5; i++) {
    board.push(boardWords.slice(i * 5, (i + 1) * 5));
  }

  return {
    board,
    roundNumber: currentRound,
    groupStarts
  };
};

const TEMPLATE_ID = "679c97472bb7cd7473304a86";

export const shemcodeRouter = Router({ mergeParams: true });

shemcodeRouter.post("/update-word", async (req, res) => {
  try {
    const { partyId } = req.params as any;
    const { rowIndex, colIndex } = req.body;

    if (!partyId) {
      res.status(400).json({ error: "Party ID is required" });
      return;
    }

    if (typeof rowIndex !== "number" || typeof colIndex !== "number") {
      res.status(400).json({ error: "Row and column indices are required and must be numbers" });
      return;
    }

    const party = await Party.findById(partyId);

    if (!party) {
      res.status(404).json({ error: "Party not found" });
      return;
    }

    const shemcodeGame = party.games.find((game) => game.templateId.equals(TEMPLATE_ID));

    if (!shemcodeGame || !shemcodeGame.rounds || shemcodeGame.rounds.length === 0) {
      res.status(404).json({ error: "No active Shemkod game found" });
      return;
    }

    const currentRound = shemcodeGame.rounds[shemcodeGame.currentRound - 1];

    if (!currentRound.board[rowIndex] || !currentRound.board[rowIndex][colIndex]) {
      res.status(400).json({ error: "Invalid board position" });
      return;
    }

    // Update the isOpen state of the word
    const updatedParty = await Party.findOneAndUpdate(
      {
        _id: partyId,
        "games.templateId": TEMPLATE_ID
      },
      {
        $set: {
          [`games.$.rounds.${shemcodeGame.currentRound - 1}.board.${rowIndex}.${colIndex}.isOpen`]: true
        }
      },
      { new: true }
    );

    if (!updatedParty) {
      res.status(404).json({ error: "Failed to update word state" });
      return;
    }

    const currentGame = updatedParty.games.find((game) => game.templateId.equals(TEMPLATE_ID));
    const currentRoundAfterUpdate = currentGame?.rounds[currentGame.currentRound - 1];

    // Check if any group has completed all their words
    if (currentRoundAfterUpdate) {
      const flatBoard = currentRoundAfterUpdate.board.flat();
      const group1Words = flatBoard.filter((tile: any) => tile.group === 1);
      const group2Words = flatBoard.filter((tile: any) => tile.group === 2);

      const group1Complete = group1Words.every((tile: any) => tile.isOpen);
      const group2Complete = group2Words.every((tile: any) => tile.isOpen);

      if (group1Complete || group2Complete) {
        // Initialize scores array if it doesn't exist
        if (!currentGame.scores || currentGame.scores.length === 0) {
          await Party.findOneAndUpdate(
            { _id: partyId, "games.templateId": TEMPLATE_ID },
            {
              $set: {
                "games.$.scores": [
                  { participantId: "group1", score: 0 },
                  { participantId: "group2", score: 0 }
                ]
              }
            },
            { new: true }
          );
        }

        // Update scores for the winning group
        const winningGroup = group1Complete ? "group1" : "group2";

        await Party.findOneAndUpdate(
          {
            _id: partyId,
            "games.templateId": TEMPLATE_ID,
            "games.scores.participantId": winningGroup
          },
          {
            $inc: { "games.$.scores.$[score].score": 1 }
          },
          {
            new: true,
            arrayFilters: [{ "score.participantId": winningGroup }]
          }
        );
      }
    }

    if (!updatedParty) {
      res.status(404).json({ error: "Failed to update word state" });
      return;
    }

    const updatedGame = updatedParty.games.find((game) => game.templateId.equals(TEMPLATE_ID));
    res.status(200).json(updatedGame);
  } catch (error) {
    console.error("Error updating word state:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

shemcodeRouter.post("/next-round", async (req, res) => {
  try {
    const { partyId } = req.params as any;
    if (!partyId) {
      res.status(400).json({ error: "Party ID is required" });
      return;
    }

    const party = await Party.findById(partyId);

    if (!party) {
      res.status(404).json({ error: "Party not found" });
      return;
    }

    const shemcodeGame = party.games.find((game) => game.templateId.equals(TEMPLATE_ID));

    if (!shemcodeGame) {
      res.status(404).json({ error: "Shemkod game not found in party" });
      return;
    }

    // Generate new round with board
    const newRound = generateBoard(shemcodeGame.currentRound + 1);

    // Update the game with the new round
    const updatedParty = await Party.findOneAndUpdate(
      { _id: partyId, "games.templateId": TEMPLATE_ID },
      {
        $push: { "games.$.rounds": newRound },
        $inc: { "games.$.currentRound": 1 }
      },
      { new: true }
    );

    if (!updatedParty) {
      res.status(404).json({ error: "Failed to update party" });
      return;
    }

    const updatedGame = updatedParty.games.find((game) => game.templateId.equals(TEMPLATE_ID));
    res.status(200).json(updatedGame);
  } catch (error) {
    console.error("Error creating next round:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

shemcodeRouter.get("/start", async (req, res) => {
  try {
    const { partyId } = req.params as any;
    if (!partyId) {
      res.status(400).json({ error: "Party ID is required" });
      return;
    }

    const party = await Party.findById(partyId);

    if (!party) {
      res.status(404).json({ error: "Party not found" });
      return;
    }

    // Find the shemcode game in the party's games array
    const shemcodeGame = party.games.find((game) => game.templateId.equals(TEMPLATE_ID));

    if (!shemcodeGame) {
      res.status(404).json({ error: "Shemkod game not found in party" });
      return;
    }

    // If there are existing rounds, return the last round
    if (shemcodeGame.rounds && shemcodeGame.rounds.length > 0) {
      res.status(200).json(shemcodeGame);
      return;
    }

    // Generate first round with board
    const newRound = generateBoard(1);

    // Use findOneAndUpdate to handle versioning
    const updatedParty = await Party.findOneAndUpdate(
      { _id: partyId, "games.templateId": TEMPLATE_ID },
      {
        $set: {
          "games.$.currentRound": 1,
          "games.$.rounds": [newRound]
        }
      },
      { new: true }
    );

    if (!updatedParty) {
      res.status(404).json({ error: "Failed to update party" });
      return;
    }

    const updatedGame = updatedParty.games.find((game) => game.templateId.equals(TEMPLATE_ID));
    res.status(200).json(updatedGame);
  } catch (error) {
    console.error("Error generating the board:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
