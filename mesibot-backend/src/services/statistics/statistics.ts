import { Statistics } from "../../models/Statistics";
import { Playlist } from "../../models/Playlist";
import { Types } from "mongoose"
// import { StatisticsService } from "../statistics/statistics";

const create = async (pid: string) => {
    const playlistId = new Types.ObjectId(pid);
    const newPlaylistStatistic = new Statistics({ 
        playlistId: playlistId, 
        topContributors: new Map(), 
        mostPopularCurators: new Map(), 
        leastPopularCurators: new Map(),
        mostLikedSongs: new Map(),
        mostDislikedSongs: new Map()
    });
    await newPlaylistStatistic.save();
}

const addSong = async (pid: string, userId: string, addedBy: { name: string; avatar: string }) => {
    const playlistId = new Types.ObjectId(pid);
    let PlaylistStatistics = await Statistics.findOne({ playlistId: playlistId });

    if (!PlaylistStatistics) {
        await create(pid);
        return await addSong(pid, userId, addedBy);
    }

    if (!PlaylistStatistics.topContributors) 
        PlaylistStatistics.topContributors = new Map();

    const userStats = PlaylistStatistics.topContributors.get(userId);

    if (!userStats) {
        PlaylistStatistics.topContributors.set(userId, {
            name: addedBy.name,
            avatar: addedBy.avatar,
            songsAdded: 1,
        });
    } else {
        userStats.songsAdded += 1;
        PlaylistStatistics.topContributors.set(userId, userStats);
    }

    await PlaylistStatistics.save();

};

const upVote = async (pid: string, songId: string, userId: string, upvotedBy: string[] = [], downvotedBy: string[] = []) => {
    const playlistId = new Types.ObjectId(pid);
    let PlaylistStatistics = await Statistics.findOne({ playlistId: playlistId });

    if (!PlaylistStatistics) {
        await create(pid);
        return await upVote(pid, songId, userId, upvotedBy, downvotedBy);
    }

    console.log("upvotedBy", upvotedBy)
    console.log("downvotedBy", downvotedBy)

    if (!PlaylistStatistics.mostPopularCurators) 
        PlaylistStatistics.mostPopularCurators = new Map();

    if (!PlaylistStatistics.mostLikedSongs) 
        PlaylistStatistics.mostLikedSongs = new Map();

    if (!PlaylistStatistics.leastPopularCurators) 
        PlaylistStatistics.leastPopularCurators = new Map();

    if (!PlaylistStatistics.mostDislikedSongs) 
        PlaylistStatistics.mostDislikedSongs = new Map();

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return console.log("(Statistics) Playlist not found");

    const song = playlist.queue.id(songId);
    if (!song || !song.addedBy || !song.addedBy.name) return console.log("(Statistics) Song Not Found!");

    const curatorId = song.addedBy.name;

    const mostPopularCurators = PlaylistStatistics.mostPopularCurators.get(curatorId);
    const mostLikedSongs = PlaylistStatistics.mostLikedSongs.get(curatorId);
    const leastPopularCurators = PlaylistStatistics.leastPopularCurators.get(curatorId);
    const mostDislikedSongs = PlaylistStatistics.mostDislikedSongs.get(curatorId);

    if (!mostPopularCurators) {
        PlaylistStatistics.mostPopularCurators.set(curatorId, {
            name: song.addedBy.name,
            avatar: song.addedBy.avatar,
            totalLikes: 1,
        });
    } else {
        if (!upvotedBy.includes(userId)) {
            mostPopularCurators.totalLikes += 1;
            upvotedBy.push(userId);
        }
        PlaylistStatistics.mostPopularCurators.set(curatorId, mostPopularCurators);
    }

    if (!leastPopularCurators) {
        PlaylistStatistics.leastPopularCurators.set(curatorId, {
            name: song.addedBy.name,
            avatar: song.addedBy.avatar,
            totalDislikes: 0,
        });
    } else {
        if (downvotedBy.includes(userId)) {
            leastPopularCurators.totalDislikes -= 1;
            downvotedBy.push(userId);
        }
        PlaylistStatistics.leastPopularCurators.set(curatorId, leastPopularCurators);
    }

    if (!mostLikedSongs) {
        PlaylistStatistics.mostLikedSongs.set(curatorId, {
            title: song.title,
            addedBy: curatorId,
            upvotes: 1,
            downvotes: 0,
        });
    } else {
        if (downvotedBy.includes(userId)) {
            mostLikedSongs.downvotes -= 1;
            upvotedBy.push(userId);
        }
        mostLikedSongs.upvotes += 1;
        PlaylistStatistics.mostLikedSongs.set(curatorId, mostLikedSongs);
    }

    if (!mostDislikedSongs) {
        PlaylistStatistics.mostDislikedSongs.set(curatorId, {
            title: song.title,
            addedBy: curatorId,
            upvotes: 1,
            downvotes: 0,
        });
    } else {
        if (downvotedBy.includes(userId)) {
            mostDislikedSongs.downvotes -= 1;
            downvotedBy.push(userId);
        }
        mostDislikedSongs.upvotes += 1;
        PlaylistStatistics.mostDislikedSongs.set(curatorId, mostDislikedSongs);
    }

    await PlaylistStatistics.save();
    await playlist.save();
    console.log("Updated PlaylistStatistics:", PlaylistStatistics);
};

const downVote = async (pid: string, songId: string, userId: string, upvotedBy: string[] = [], downvotedBy: string[] = []) => {
    const playlistId = new Types.ObjectId(pid);
    let PlaylistStatistics = await Statistics.findOne({ playlistId: playlistId });

    console.log("upvotedBy", upvotedBy)
    console.log("downvotedBy", downvotedBy)

    if (!PlaylistStatistics) {
        await create(pid);
        return await downVote(pid, songId, userId, upvotedBy, downvotedBy);
    }

    if (!PlaylistStatistics.mostPopularCurators) 
        PlaylistStatistics.mostPopularCurators = new Map();

    if (!PlaylistStatistics.mostLikedSongs) 
        PlaylistStatistics.mostLikedSongs = new Map();

    if (!PlaylistStatistics.leastPopularCurators) 
        PlaylistStatistics.leastPopularCurators = new Map();

    if (!PlaylistStatistics.mostDislikedSongs) 
        PlaylistStatistics.mostDislikedSongs = new Map();


    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return console.log("(Statistics) Playlist not found");

    const song = playlist.queue.id(songId);
    if (!song || !song.addedBy || !song.addedBy.name) return console.log("(Statistics) Song Not Found!");

    const curatorId = song.addedBy.name;
    const mostPopularCurators = PlaylistStatistics.mostPopularCurators.get(curatorId);
    const mostLikedSongs = PlaylistStatistics.mostLikedSongs.get(curatorId);
    const leastPopularCurators = PlaylistStatistics.leastPopularCurators.get(curatorId);
    const mostDislikedSongs = PlaylistStatistics.mostDislikedSongs.get(curatorId);

    if (!mostPopularCurators) {
        PlaylistStatistics.mostPopularCurators.set(curatorId, {
            name: song.addedBy.name,
            avatar: song.addedBy.avatar,
            totalLikes: 0,
        });
    } else {
        if (upvotedBy.includes(userId)) {
            mostPopularCurators.totalLikes -= 1;
            upvotedBy.push(userId);
        }
        PlaylistStatistics.mostPopularCurators.set(curatorId, mostPopularCurators);
    }

    if (!leastPopularCurators) {
        PlaylistStatistics.leastPopularCurators.set(curatorId, {
            name: song.addedBy.name,
            avatar: song.addedBy.avatar,
            totalDislikes: 1,
        });
    } else {
        if (!downvotedBy.includes(userId)) {
            leastPopularCurators.totalDislikes += 1;
            downvotedBy.push(userId);
        }
        PlaylistStatistics.leastPopularCurators.set(curatorId, leastPopularCurators);
    }

    if (!mostLikedSongs) {
        PlaylistStatistics.mostLikedSongs.set(curatorId, {
            title: song.title,
            addedBy: curatorId,
            upvotes: 0,
            downvotes: 1,
        });
    } else {
        if (upvotedBy.includes(userId)) {
            mostLikedSongs.upvotes -= 1;
            upvotedBy.push(userId);
        }
        mostLikedSongs.downvotes += 1;
        PlaylistStatistics.mostLikedSongs.set(curatorId, mostLikedSongs);
    }

    if (!mostDislikedSongs) {
        PlaylistStatistics.mostDislikedSongs.set(curatorId, {
            title: song.title,
            addedBy: curatorId,
            upvotes: 0,
            downvotes: 1,
        });
    } else {
        if (upvotedBy.includes(userId)) {
            mostDislikedSongs.upvotes -= 1;
            upvotedBy.push(userId);
        }
        mostDislikedSongs.downvotes += 1;
        PlaylistStatistics.mostDislikedSongs.set(curatorId, mostDislikedSongs);
    }

    await PlaylistStatistics.save();
    await playlist.save();
    console.log("Updated PlaylistStatistics:", PlaylistStatistics);
};

//Change The Functions to Add/Remove


// Statistics.findOneAndDelete({ playlistId: "67926c2b408ebe6cf58e7dcd" }).then(async (statistics) => {
//     console.log("Deleted Statistic")
// })


Statistics.findOne({ playlistId: "67926c2b408ebe6cf58e7dcd" }).then(async (statistics) => {
    if(!statistics) {
        console.log("(Statistics) No statistics")
        return await create("67926c2b408ebe6cf58e7dcd");
    }

    const playlist = await Playlist.findById("67926c2b408ebe6cf58e7dcd");
    if (!playlist) 
        return;
    // console.log("Playlist", playlist.queue)
    // const songId = new Types.ObjectId("679680e0ee8d890c5615fe28");
    // const song = playlist.songs.id("679680e0ee8d890c5615fe28");

    // console.log("Songs", song)
    // console.log("Songs", statistics)
});

export const StatisticsService = {
    create,
    addSong,
    upVote,
    downVote
};