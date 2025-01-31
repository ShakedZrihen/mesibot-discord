import { Router } from "express";
import { guessTheSongRouter } from "./guess-the-song";
import { semkodRouter } from "./shemkod";

export const gamesRouter = Router();

gamesRouter.use("/guess-the-song", guessTheSongRouter);

gamesRouter.use("/shemkod", semkodRouter);
