import { styled } from "@mui/material";
import { useState } from "react";
import { GameBoard } from "./GameBoard";
import { Instructions } from "./Instructions";

const StyledContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const ShemKodView = () => {
  const [started, setStarted] = useState(false);

  // TODO: save in localstorage the gameId and the status

  return (
    <StyledContainer>{started ? <GameBoard mode="host" /> : <Instructions setStarted={setStarted} />}</StyledContainer>
  );
};
