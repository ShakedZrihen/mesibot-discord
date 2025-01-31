import { Router } from "express";
import { getRandomSong } from "./resources/songs-pull";

export const guessTheSongRouter = Router();

guessTheSongRouter.get("/song", async (req, res) => {
  const song = getRandomSong();
  res.status(200).send(song);
});
