import { Statistics } from "../../models/Statistics";
import { Playlist } from "../../models/Playlist";
import { Types } from "mongoose"

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

    return await newPlaylistStatistic.save();
}

const addSong = async (pid: string, userId: string, addedBy: { name: string; avatar: string }) => {
    const playlistId = new Types.ObjectId(pid);
    let PlaylistStatistics = await Statistics.findOne({ playlistId: playlistId });

    if (!PlaylistStatistics) 
        PlaylistStatistics = await create(pid);

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

    if (!PlaylistStatistics) 
        PlaylistStatistics = await create(pid);

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        console.log("(Statistics) Playlist not found");
        return;
    }

    const song = playlist.queue.id(songId);
    if (!song || !song.addedBy || !song.addedBy.name) {
        console.log("(Statistics) Song Not Found!");
        return
    }

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

    if (!PlaylistStatistics) 
        PlaylistStatistics = await create(pid);

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) { 
        console.log("(Statistics) Playlist not found");
        return 
    }

    const song = playlist.queue.id(songId);
    if (!song || !song.addedBy || !song.addedBy.name) {
        console.log("(Statistics) Song Not Found!");
        return 
    }

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

export const StatisticsService = {
    create,
    addSong,
    upVote,
    downVote
};