/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { AddSongModal } from "../../../components/AddSongModal/AddSongModal";
import { AddSong } from "../../../components/AddSongButton";
import { useAppContext } from "../../../context/useAppContext";
import { getPlaylistSongs } from "../../../services/mesibotApi";
import { EventTypes } from "../../../services/websocketService";
import { Song } from "../../../types/playlist";
import { Playlist } from "../../../components/Playlist";
import SkipSongModal from "./SkipModal";
import { SongRow } from "../../../components/Playlist/types";

export const PlaylistView = () => {
  const [openModal, setOpenModal] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [playedSongs, setPlayedSongs] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const { websocketService } = useAppContext();
  const [openSkipModal, setOpenSkipModal] = useState(false);
  const [skipModalProps, setSkipModalProps] = useState({});

  const { party } = useAppContext();
  const skippedSong = ({ song }: { song: SongRow }) => {
    setSkipModalProps({ song });
    setOpenSkipModal(true);
    setTimeout(() => {
      setOpenSkipModal(false);
    }, 2000);
  };

  const updateSongs = ({
    currentSong,
    songs,
    playedSongs,
    played
  }: {
    currentSong: Song | null;
    songs: Song[];
    playedSongs: Song[];
    played?: Song[];
  }) => {
    if (currentSong) {
      setCurrentSong({ ...currentSong, number: 1 });
    }

    setSongs(songs.map((song: Song, index: number) => ({ ...song, number: index + 2 })));
    setPlayedSongs(playedSongs ?? played);
  };

  useEffect(() => {
    if (!party?._id) {
      return;
    }

    // Initial fetch
    getPlaylistSongs(party._id).then(updateSongs);

    websocketService?.signEvent(EventTypes.PLAYLIST_UPDATE, updateSongs);
    websocketService?.signEvent(EventTypes.SONG_SKIPPED, skippedSong);
  }, [party, websocketService]);

  return (
    <>
      <Playlist currentSong={currentSong} songs={songs} playedSongs={playedSongs} />
      <AddSong onClick={() => setOpenModal(true)} />
      <AddSongModal open={openModal} onClose={() => setOpenModal(false)} />
      <SkipSongModal open={openSkipModal} {...skipModalProps} />
    </>
  );
};
