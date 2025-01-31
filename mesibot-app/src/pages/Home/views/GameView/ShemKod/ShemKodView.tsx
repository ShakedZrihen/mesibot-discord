import { styled } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GameBoard } from "./GameBoard";
import { Instructions } from "./Instructions";
import { Mode } from "./types";
import { StorageKeys } from "../../../../../consts/storageKeys";

const StyledContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const ShemKodView = () => {
  const storageStarted = localStorage.getItem(StorageKeys.SHEMCODE_STARTED) === "true";
  const [started, setStarted] = useState(storageStarted || false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    localStorage.setItem(StorageKeys.SHEMCODE_STARTED, started.toString());
  }, [started]);

  const getModeFromQueryParams = () => {
    const modeParam = searchParams.get("mode") as Mode;

    if ([Mode.Board, Mode.Map].includes(modeParam || "")) {
      return modeParam;
    }

    return Mode.Board;
  };

  const mode = getModeFromQueryParams();

  // TODO: save in localstorage the gameId and the status

  return (
    <StyledContainer>{started ? <GameBoard mode={mode} /> : <Instructions setStarted={setStarted} />}</StyledContainer>
  );
};
