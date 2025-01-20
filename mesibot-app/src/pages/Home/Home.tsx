import { Topbar } from "../../components/Topbar";
import { styled } from "@mui/material";
import { Playlist } from "../../components/Playlist";
import { mockCurrentSong, mockSongs } from "../../mocks/playlist";
import { AddSong } from "../../components/AddSong";
import { AddSongModal } from "../../components/AddSongModal/AddSongModal";
import { useState } from "react";

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

  return (
    <StyledHome>
      <Topbar />
      <Playlist currentSong={mockCurrentSong} songs={mockSongs} />
      <AddSong onClick={() => setOpenModal(true)} />
      <AddSongModal open={openModal} onClose={() => setOpenModal(false)} />
    </StyledHome>
  );
};
