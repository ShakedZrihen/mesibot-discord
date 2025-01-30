import { Router } from "express";
import { playlistRouter } from "./playlist";
import { gamesRouter } from "./games";

export const partyRouter = Router();

partyRouter.post("/create", async (req, res) => {});

partyRouter.use("/:partyId/playlist", playlistRouter);
partyRouter.use("/:partyId/games", gamesRouter);
