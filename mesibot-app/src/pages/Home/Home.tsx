import { Topbar } from "../../components/Topbar";
import { styled } from "@mui/material";
import { Playlist } from "../../components/Playlist";
import { mockCurrentSong, mockSongs } from "../../mocks/playlist";
import { AddSong } from "../../components/AddSong";

const StyledHome = styled("div")`
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url("/bg.png");
  background-repeat: repeat;
  background-size: auto;
  overflow: hidden;
`;

export const Home = () => {
  return (
    <StyledHome>
      <Topbar />
      <Playlist currentSong={mockCurrentSong} songs={mockSongs} />
      <AddSong />
    </StyledHome>
  );
};
