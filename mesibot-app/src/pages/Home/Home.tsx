import { Topbar } from "../../components/Topbar";
import { styled } from "@mui/material";
import { Playlist } from "../../components/Playlist";
import { AddSong } from "../../components/AddSongButton";
import { AddSongModal } from "../../components/AddSongModal/AddSongModal";
import { useEffect, useState } from "react";
import { getPlaylistSongs } from "../../services/mesibotApi";
import { Song } from "../../types/playlist";
import { useAppContext } from "../../context/useAppContext";

const StyledHome = styled("div")`
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url("/bg.png");
  background-repeat: repeat;
  background-size: auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const Home = () => {
  const [openModal, setOpenModal] = useState(false);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);

  const { playlistId } = useAppContext();

  useEffect(() => {
    if (!playlistId) {
      return;
    }

    const fetchSongs = () =>
      getPlaylistSongs(playlistId).then(({ songs, currentSong }) => {
        if (currentSong) {
          setCurrentSong({ ...currentSong, number: 1 });
        }
        setSongs(songs.map((song: Song, index: number) => ({ ...song, number: index + 2 })));
      });

    const intervalId = setInterval(fetchSongs, 3000);

    fetchSongs();

    return () => clearInterval(intervalId);
  }, [playlistId]);

  return (
    <StyledHome>
      <Topbar />
      <Playlist currentSong={currentSong} songs={songs} />
      <AddSong onClick={() => setOpenModal(true)} />
      <AddSongModal open={openModal} onClose={() => setOpenModal(false)} />
    </StyledHome>
  );
};
