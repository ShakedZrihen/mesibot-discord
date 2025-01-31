/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { CircularProgress, Typography } from "@mui/material";
import { GameBoardContainer, RowContainer, StyledLoader, WordCard } from "./GameBoard.style";
import * as mesibotApi from "../../../../../services/mesibotApi";
import { useAppContext } from "../../../../../context/useAppContext";

interface WordTile {
  word: string;
  group: number | "neutral";
}

interface GameBoardProps {
  mode: "host" | "player";
}

export const GameBoard = ({ mode }: GameBoardProps) => {
  const boardRef = useRef<WordTile[][] | null>(null);
  const revealedTilesRef = useRef<boolean[][] | null>(null);
  const [, forceRender] = useState(0); // Dummy state to trigger re-render
  const { party } = useAppContext();

  useEffect(() => {
    const start = async () => {
      if (!boardRef.current) {
        // Prevent re-fetching if board already exists
        const response = await mesibotApi.getShemkodBoard(party?._id ?? "");
        boardRef.current = response.board;
        revealedTilesRef.current = response.board.map((row: any) => row.map(() => mode === "player")); // Reveal all in player mode
        forceRender((prev) => prev + 1); // Trigger one-time re-render
      }
    };

    if (party?._id) {
      start();
    }
  }, [party, mode]);

  const handleReveal = (rowIndex: number, colIndex: number) => {
    if (mode === "host" && revealedTilesRef.current) {
      revealedTilesRef.current[rowIndex][colIndex] = true;
      forceRender((prev) => prev + 1); // Trigger re-render to reveal the tile
    }
  };

  if (!boardRef.current || !revealedTilesRef.current) {
    return (
      <StyledLoader>
        <CircularProgress />
      </StyledLoader>
    );
  }

  return (
    <GameBoardContainer>
      {boardRef.current.map((row, rowIndex) => (
        <RowContainer key={rowIndex}>
          {row.map((tile, colIndex) => (
            <WordCard
              key={`${rowIndex}-${colIndex}`}
              group={revealedTilesRef.current?.[rowIndex][colIndex] ? tile.group : "hidden"} // Show color only if revealed
              onClick={() => handleReveal(rowIndex, colIndex)}
            >
              <Typography variant="h6">{tile.word}</Typography>
            </WordCard>
          ))}
        </RowContainer>
      ))}
    </GameBoardContainer>
  );
};
