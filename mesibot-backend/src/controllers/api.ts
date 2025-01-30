import { Router } from "express";
import { playlistRouter } from "./party/playlist/playlist";
import { songsRouter } from "./party/playlist/songs";
import { partyRouter } from "./party";

export const apiRouter = Router();

apiRouter.use("/playlists", playlistRouter);
apiRouter.use("/songs", songsRouter);
apiRouter.use("/party", partyRouter);
