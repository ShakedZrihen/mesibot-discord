import { Request, Response, Router } from "express";
import { GameTemplate } from "../../models/GameTemplate";
import { Party } from "../../models/Party";
import { playlistService } from "../../services/playlist";
import { addSongToPlaylist, downvoteSontInPlaylist, getPartyPlaylist, upvoteSongInPlaylist } from "./playlist/playlist";
import { guessTheSongRouter } from "./games/guess-the-song";
import { shemcodeRouter } from "./games/shemkod";
import { stream } from "./stream";

export const partyRouter = Router();

partyRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, host, games } = req.body;

    // Validate request
    if (!title || !host?.name || !host?.avatar) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Fetch selected game templates
    const gameTemplates = await GameTemplate.find({ _id: { $in: games } });

    // Clone games for the party
    const gameInstances = gameTemplates.map((template) => ({
      templateId: template._id,
      title: template.name,
      maxRounds: template.maxRounds,
      rounds: [],
      currentRound: 0,
      scores: []
    }));

    const playlist = await playlistService.create(title);

    // Create a new party
    const newParty = new Party({
      title,
      host,
      playlist: playlist._id,
      games: gameInstances,
      participants: []
    });

    await newParty.save();

    res.status(201).json(newParty);
  } catch (error) {
    console.error("Error creating party:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

partyRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const parties = await Party.find();
    res.status(200).json(parties);
  } catch (error) {
    console.error("Error fetching parties:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

partyRouter.get("/games", async (req, res) => {
  try {
    const games = await GameTemplate.find();
    res.status(200).json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

partyRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const party = await Party.findById(req.params.id).populate("playlist");

    if (!party) {
      res.status(404).json({ error: "Party not found" });
      return;
    }

    res.status(200).json(party);
  } catch (error) {
    console.error("Error fetching party:", error);
  }
});

partyRouter.get("/:partyId/playlist/start", stream);

partyRouter.get("/:partyId/playlist", getPartyPlaylist);
partyRouter.post("/:partyId/playlist/add-song", addSongToPlaylist);
partyRouter.post("/:partyId/playlist/upvote", upvoteSongInPlaylist);
partyRouter.post("/:partyId/playlist/downvote", downvoteSontInPlaylist);

partyRouter.post("/:partyId/join", async (req: Request, res: Response): Promise<void> => {
  try {
    const { partyId } = req.params;
    const { name, avatar } = req.body;

    if (!name || !avatar) {
      res.status(400).json({ error: "Name and avatar are required" });
      return;
    }

    const party = await Party.findById(partyId);

    if (!party) {
      res.status(404).json({ error: "Party not found" });
      return;
    }

    // Check if participant already exists
    const existingParticipant = party.participants.find((p) => p.name === name && p.avatar === avatar);

    if (existingParticipant) {
      res.status(200).json(party);
      return;
    }

    // Create new participant
    const newParticipant = { name, avatar, score: 0 };
    party.participants.push(newParticipant);

    const updatedParty = await party.save();

    res.status(200).json(updatedParty);
  } catch (error) {
    console.error("Error joining party:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

partyRouter.use("/:partyId/games/guess-the-song", guessTheSongRouter);

partyRouter.use("/:partyId/games/shemkod", shemcodeRouter);
