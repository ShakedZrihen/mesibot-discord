import { Router } from "express";
import { playlistRouter } from "./playlist";
import { songsRouter } from "./songs";
import { gamesRouter } from "./games";

export const apiRouter = Router();

apiRouter.use("/playlists", playlistRouter);
apiRouter.use("/songs", songsRouter);

apiRouter.use("/games", gamesRouter);
