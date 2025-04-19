/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { AddSongModal } from "../../../components/AddSongModal/AddSongModal";
import { AddSong } from "../../../components/AddSongButton";
import { useAppContext } from "../../../context/useAppContext";
import { getPlaylistSongs } from "../../../services/mesibotApi";
import { EventTypes } from "../../../services/websocketService";
import { Song } from "../../../types/playlist";
import { Playlist } from "../../../components/Playlist";

export const PlaylistView = () => {
  const [openModal, setOpenModal] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [playedSongs, setPlayedSongs] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const { websocketService } = useAppContext();

  const { party } = useAppContext();

  const updateSongs = ({
    currentSong,
    songs,
    playedSongs
  }: {
    currentSong: Song | null;
    songs: Song[];
    playedSongs: Song[];
  }) => {
    if (currentSong) {
      setCurrentSong({ ...currentSong, number: 1 });
    }

    setSongs(songs.map((song: Song, index: number) => ({ ...song, number: index + 2 })));
    setPlayedSongs(playedSongs);
  };

  useEffect(() => {
    if (!party?._id) {
      return;
    }

    // Initial fetch
    getPlaylistSongs(party._id).then(updateSongs);

    websocketService?.signEvent(EventTypes.PLAYLIST_UPDATE, updateSongs);
  }, [party, websocketService]);

  return (
    <>
      <Playlist currentSong={currentSong} songs={songs} playedSongs={playedSongs} />
      <AddSong onClick={() => setOpenModal(true)} />
      <AddSongModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};
