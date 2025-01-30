import { Router } from "express";

export const guessTheSongRouter = Router();

guessTheSongRouter.post("/create-room", (req, res) => {
  // create room
  // return room
});

guessTheSongRouter.post("/join-room/:roomId", async (req, res) => {
  const { body } = req.body;
  const { roomId } = req.params;
  const { group } = body;

  /**
   * group:
   * {
   * id: uuid,
   * name: string,
   * rank: number default 0,
   * winningRounds: []
   *
   * }
   */

  if (!group) {
    res.status(400).send("missing group in body");
    return;
  }
});

guessTheSongRouter.post("/start-game/:roomId", async () => {});

guessTheSongRouter.get("/song", async (req, res) => {
  // call to chat gpt to generate song
  /**
   *
   * return the song in format:
   * {
   * songName: '',
   * artist: '',
   * engLyrics: [],
   * hebLyrics: []
   * }
   */
});
