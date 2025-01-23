import { Router } from "express";
import { playlistRouter } from "./playlist";
import { songsRouter } from "./songs";

export const apiRouter = Router();

apiRouter.use("/playlists", playlistRouter);
apiRouter.use("/songs", songsRouter);