import mongoose from "mongoose";

const StatisticSchema = new mongoose.Schema({

    playlistId: { type: mongoose.Schema.Types.ObjectId, ref: "Playlist", required: true, unique: true },

    // 1️⃣ Top Contributors: Users who added the most songs
    topContributors: {
        type: Map,
        of: {
          name: String,
          avatar: String,
          songsAdded: { type: Number, default: 0 }
        }
    },

    // 2️⃣ Most Popular Curators: Users whose songs got the most upvotes
    mostPopularCurators: {
        type: Map,
        of: {
            name: String,
            avatar: String,
            totalLikes: { type: Number, default: 0 }
        }
    },

    // 3️⃣ Least Popular Curators: Users whose songs got the most downvotes
    leastPopularCurators: {
        type: Map,
        of: {
          name: String,
          avatar: String,
          totalDislikes: { type: Number, default: 0 }
        }
    },

    // 4️⃣ Most Liked Songs: Tracks with the highest upvotes
    mostLikedSongs: {
        type: Map,
        of: {
          title: String,
          addedBy: String, // userId of the curator
          upvotes: { type: Number, default: 0 },
          downvotes: { type: Number, default: 0 }
        }
    },

    // 5️⃣ Most Disliked Songs: Tracks with the highest downvotes
    mostDislikedSongs: {
        type: Map,
        of: {
          title: String,
          addedBy: String, // userId of the curator
          upvotes: { type: Number, default: 0 },
          downvotes: { type: Number, default: 0 }
        }
    }

}, { timestamps: true });

export const Statistics = mongoose.model("Statistics", StatisticSchema);
