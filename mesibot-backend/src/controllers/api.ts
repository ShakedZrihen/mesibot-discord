import { Router } from "express";
import { songsRouter } from "./party/playlist/songs";
import { partyRouter } from "./party";

export const apiRouter = Router();

apiRouter.use("/songs", songsRouter);
apiRouter.use("/party", partyRouter);
