import mongoose from "mongoose";
import { Models } from ".";

const GameTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rules: mongoose.Schema.Types.Mixed,
  maxRounds: { type: Number, default: 10 }
});

export const GameTemplate = mongoose.model(Models.GameTemplate, GameTemplateSchema);
