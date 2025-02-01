import { useEffect, useRef, useState } from "react";
import { CircularProgress, Typography } from "@mui/material";
import { GameBoardContainer, RowContainer, StyledLoader, WordCard ,RemainingCards, RemainingCardsContainer} from "./GameBoard.style";
import * as mesibotApi from "../../../../../services/mesibotApi";
import { useAppContext } from "../../../../../context/useAppContext";
import { Groups, Mode } from "./types";
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

const cardsState = (board: WordTile[][] | null) => {
  if (!board) {
    return null;
  }
  const cardsState: {blueCardsRemaining:number, redCardsRemaining:number, winner:number | null } = {
    blueCardsRemaining : 0,
    redCardsRemaining : 0,
    winner: null
  }

  board.forEach((row) => {
    row.forEach((tile) => {
      if (!tile.isOpen) {
        if (tile.group === Groups.Red) {
          cardsState["blueCardsRemaining"]++;
        }
        if (tile.group === Groups.Blue) {
          cardsState["redCardsRemaining"]++;
        }
      }
    });
  });

  if (cardsState["blueCardsRemaining"] === 0) {
    // Blue team wins
    cardsState["winner"] = 1;
    return cardsState;
  }
  if (cardsState["redCardsRemaining"] === 0) {
    // Red team wins
    cardsState["winner"] = 2;
    return cardsState;
    
  }
  // No winner yet
  cardsState["winner"] = null;
  return cardsState; 
};

export const GameBoard = ({ mode }: GameBoardProps) => {
  const boardRef = useRef<WordTile[][] | null>(null);
  const hasFetchedData = useRef(false);
  const [, forceRender] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [remainingCards, setRemainingCards] = useState<{blues:number, reds:number}>({blues:0, reds:0});
  const { party } = useAppContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseResponse = async (response: any) => {
    const currentRoundIndex = response.currentRound - 1;
    if (response.rounds[currentRoundIndex]) {
      boardRef.current = response.rounds[currentRoundIndex].board;
      const CurrCardState = cardsState(boardRef.current);
      if (CurrCardState?.winner) {
        setWinner(CurrCardState.winner);
        setModalOpen(true);
      }
      setRemainingCards({blues:CurrCardState?.blueCardsRemaining || 0, reds:CurrCardState?.redCardsRemaining || 0});
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
      {mode === "map" ? null:
      <RemainingCardsContainer>
        <RemainingCards group={"red"}>
          <Typography variant="h6">אדומים: {remainingCards.blues}</Typography>
        </RemainingCards>
        <RemainingCards group={"blue"}>
          <Typography variant="h6">כחולים: {remainingCards.reds}</Typography>
        </RemainingCards>
      </RemainingCardsContainer>}
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
