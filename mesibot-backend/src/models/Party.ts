import mongoose from "mongoose";
import { PlaylistSchema } from "./Playlist";
import { Models } from ".";

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  score: { type: Number, default: 0 }
});

const GameInstanceSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: Models.GameTemplate, required: true },
  title: { type: String, required: true },
  rounds: [mongoose.Schema.Types.Mixed],
  maxRounds: { type: Number, default: 10 },
  currentRound: { type: Number, default: 0 },
  scores: [{ participantId: mongoose.Schema.Types.Mixed, score: Number }]
});

const PartySchema = new mongoose.Schema({
  title: { type: String, required: true },
  playlist: { type: mongoose.Schema.Types.ObjectId, ref: Models.Playlist, required: true },
  host: {
    name: { type: String, required: true },
    avatar: { type: String, required: true }
  },
  participants: [ParticipantSchema],
  games: [GameInstanceSchema]
});

export const Party = mongoose.model(Models.Party, PartySchema);
