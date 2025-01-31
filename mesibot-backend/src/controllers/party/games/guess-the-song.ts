import { Router } from "express";
import { getRandomSong } from "./resources/songs-pull";

export const guessTheSongRouter = Router();

guessTheSongRouter.get("/song", async (req, res) => {
  const song = getRandomSong();
  res.status(200).send(song);
});

guessTheSongRouter.post("/buzzer", async (req, res) => {
  const { user } = req.body;

  // TODO: notify through websocket
  res.sendStatus(200);
});
