import { styled } from "@mui/material";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GameBoard } from "./GameBoard";
import { Instructions } from "./Instructions";
import { useAppContext } from "../../../../../context/useAppContext";

const StyledContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const ShemKodView = () => {
  const [started, setStarted] = useState(false);
  const { connectedUser, party } = useAppContext();
  const [searchParams] = useSearchParams();

  const getModeFromQueryParams = () => {
    const modeParam = searchParams.get("mode");

    if (["player", "host"].includes(modeParam || "")) {
      return modeParam as "player" | "host";
    }

    const isHost = connectedUser?.name === party?.host.name;
    return isHost ? "host" : "player";
  };

  const mode = getModeFromQueryParams();

  // TODO: save in localstorage the gameId and the status

  return (
    <StyledContainer>{started ? <GameBoard mode={mode} /> : <Instructions setStarted={setStarted} />}</StyledContainer>
  );
};
