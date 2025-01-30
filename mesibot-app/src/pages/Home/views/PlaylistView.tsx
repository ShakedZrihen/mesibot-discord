/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { AddSongModal } from "../../../components/AddSongModal/AddSongModal";
import { AddSong } from "../../../components/AddSongButton";
import { useAppContext } from "../../../context/useAppContext";
import { getPlaylistSongs } from "../../../services/mesibotApi";
import { WebSocketService } from "../../../services/websocketService";
import { Song } from "../../../types/playlist";
import { Playlist } from "../../../components/Playlist";

export const PlaylistView = () => {
  const [openModal, setOpenModal] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const wsRef = useRef<WebSocketService | null>(null);

  const { party } = useAppContext();

  const updateSongs = ({ currentSong, songs }: { currentSong: Song | null; songs: Song[] }) => {
    if (currentSong) {
      setCurrentSong({ ...currentSong, number: 1 });
    }

    setSongs(songs.map((song: Song, index: number) => ({ ...song, number: index + 2 })));
  };

  useEffect(() => {
    if (!party?._id) {
      return;
    }

    // Initial fetch
    getPlaylistSongs(party._id).then(updateSongs);

    // Setup WebSocket connection
    wsRef.current = new WebSocketService(party.playlist._id, updateSongs);

    // Cleanup WebSocket on unmount
    return () => {
      wsRef.current?.disconnect();
    };
  }, [party]);

  return (
    <>
      <Playlist currentSong={currentSong} songs={songs} />
      <AddSong onClick={() => setOpenModal(true)} />
      <AddSongModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};
