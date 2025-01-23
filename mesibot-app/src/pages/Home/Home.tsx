import { Topbar } from "../../components/Topbar";
import { styled } from "@mui/material";
import { Playlist } from "../../components/Playlist";
import { AddSong } from "../../components/AddSongButton";
import { AddSongModal } from "../../components/AddSongModal/AddSongModal";
import { useEffect, useState } from "react";
import { getPlaylistSongs } from "../../services/mesibotApi";

const StyledHome = styled("div")`
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url("/bg.png");
  background-repeat: repeat;
  background-size: auto;
  overflow: hidden;
`;

export const Home = () => {
  const [openModal, setOpenModal] = useState(false);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getPlaylistSongs().then((songs) => {
        setCurrentSong({ ...songs[0], number: 1 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSongs(songs.slice(1).map((song: any, index: number) => ({ ...song, number: index + 1 })));
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <StyledHome>
      <Topbar />
      <Playlist currentSong={currentSong} songs={songs} />
      <AddSong onClick={() => setOpenModal(true)} />
      <AddSongModal open={openModal} onClose={() => setOpenModal(false)} />
    </StyledHome>
  );
};
