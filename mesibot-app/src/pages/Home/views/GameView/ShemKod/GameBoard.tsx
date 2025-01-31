import { useEffect, useRef, useState } from "react";
import { CircularProgress, Typography } from "@mui/material";
import { GameBoardContainer, RowContainer, StyledLoader, WordCard } from "./GameBoard.style";
import * as mesibotApi from "../../../../../services/mesibotApi";
import { useAppContext } from "../../../../../context/useAppContext";
import { Mode } from "./types";
import { SuccessModal } from "../components/SuccessModal";

interface WordTile {
  word: string;
  group: number | "neutral";
  isOpen: boolean;
}

interface GameData {
  currentRound: number;
  rounds: { board: WordTile[][]; roundNumber: number }[];
  winner?: number;
}

interface GameBoardProps {
  mode: Mode;
}

const getWinner = (board: WordTile[][] | null) => {
  if (!board) {
    return null;
  }

  let blueCardsRemaining = 0;
  let redCardsRemaining = 0;

  board.forEach((row) => {
    row.forEach((tile) => {
      if (!tile.isOpen) {
        if (tile.group === 1) {
          blueCardsRemaining++;
        }
        if (tile.group === 2) {
          redCardsRemaining++;
        }
      }
    });
  });

  if (blueCardsRemaining === 0) {
    // Blue team wins
    return 1;
  }
  if (redCardsRemaining === 0) {
    // Red team wins
    return 2;
  }

  return null; // No winner yet
};

export const GameBoard = ({ mode }: GameBoardProps) => {
  const boardRef = useRef<WordTile[][] | null>(null);
  const hasFetchedData = useRef(false);
  const [, forceRender] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const { party } = useAppContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseResponse = async (response: any) => {
    const currentRoundIndex = response.currentRound - 1;
    if (response.rounds[currentRoundIndex]) {
      boardRef.current = response.rounds[currentRoundIndex].board;
      const winner = getWinner(boardRef.current);
      if (winner) {
        setWinner(winner);
        setModalOpen(true);
      }
      forceRender((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const start = async () => {
      if (!boardRef.current && party?._id && !hasFetchedData.current) {
        hasFetchedData.current = true;
        const response: GameData = await mesibotApi.getShemkodBoard(party?._id);
        parseResponse(response);
      }
    };

    start();
  }, [party?._id]);

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const nextRound = async () => {
    if (party?._id) {
      hasFetchedData.current = false;
      boardRef.current = null;
      setWinner(null);
      setModalOpen(false);
      const response = await mesibotApi.nextRoundShemkod(party._id);
      parseResponse(response);
    }
  };

  if (!boardRef.current) {
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
              group={mode === "map" ? tile.group : tile.isOpen ? tile.group : "hidden"}
              onClick={async () => {
                if (mode !== "map" && !tile.isOpen) {
                  const response = await mesibotApi.updateShemkodBoard(party?._id || "", rowIndex, colIndex);
                  parseResponse(response);
                }
              }}
            >
              <Typography variant="h6">{tile.word}</Typography>
            </WordCard>
          ))}
        </RowContainer>
      ))}

      <SuccessModal
        modalOpen={modalOpen}
        handleModalClose={handleModalClose}
        nextRound={nextRound}
        description={`קבוצה ${winner === 2 ? "כחולה" : "אדומה"} ניצחה!`}
      />
    </GameBoardContainer>
  );
};
