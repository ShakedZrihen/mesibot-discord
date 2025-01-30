import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  youtubeId: { type: String, required: true },
  addedBy: { name: String, avatar: String },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  downvotedBy: [{ type: String }],
  introUrl: { type: String, default: null }
});

export const PlaylistSchema = new mongoose.Schema(
  {
    title: String,
    userId: String,
    guildId: String,
    playlistName: String,
    songs: [SongSchema],
    currentPlaying: { type: SongSchema, default: null },
    queue: [SongSchema],
    played: [SongSchema]
  },
  { versionKey: false }
);

export const Playlist = mongoose.model("Playlist", PlaylistSchema);
