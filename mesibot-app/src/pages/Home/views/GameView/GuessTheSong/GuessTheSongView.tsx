import { styled } from "@mui/material";
import { useState } from "react";
import { GameBoard } from "./GameBoard";
import { Instructions } from "./Instructions";

const StyledContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20vh;
`;

export const GuessTheSongView = () => {
  const [started, setStarted] = useState(false);

  // TODO: save in localstorage the gameId and the status

  return <StyledContainer>{started ? <GameBoard /> : <Instructions setStarted={setStarted} />}</StyledContainer>;
};
