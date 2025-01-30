import mongoose from "mongoose";
import { Models } from ".";

const SongSchema = new mongoose.Schema({
  songName: String,
  artist: String,
  engLyrics: [String],
  hebLyrics: [String]
});

const RoundSchema = new mongoose.Schema({
  number: {
    type: Number,
    default: 1
  },
  song: SongSchema
});

const Group = new mongoose.Schema({
  id: String,
  name: String,
  rank: {
    type: Number,
    default: 0
  },
  winningRounds: [Number]
});

export const GameSchema = new mongoose.Schema({
  title: String,
  rounds: [RoundSchema],
  maxRounds: {
    type: Number,
    default: 10
  },
  currentRound: {
    type: Number,
    default: 0
  },
  groups: [Group]
});

export const Game = mongoose.model(Models.Game, GameSchema);
