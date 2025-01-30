import { clear } from "console";
import { create } from "domain";
import { addSong } from "./addSong";
import { downvoteSong } from "./downvote";
import { getAll } from "./getAll";
import { getOne } from "./getOne";
import { play } from "./play";
import { reset } from "./reset";
import { upvoteSong } from "./upvoteSong";
import { playNext } from "./playNext";

export const playlistService = {
  create,
  getAll,
  getOne,
  addSong,
  upvoteSong,
  downvoteSong,
  play,
  playNext,
  clear,
  reset
};
