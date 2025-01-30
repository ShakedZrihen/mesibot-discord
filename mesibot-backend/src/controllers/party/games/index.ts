import { Router } from "express";
import { guessTheSongRouter } from "./guess-the-song";

export const gamesRouter = Router();

gamesRouter.use("/guess-the-song", guessTheSongRouter);
