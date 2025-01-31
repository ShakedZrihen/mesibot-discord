import { useEffect, useState } from "react";
import { TextField, IconButton, InputAdornment, Box, CircularProgress } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
  ActionsContainer,
  GameBoardContainer,
  LinesContainer,
  NextButton,
  SkipButton,
  StyledLine
} from "./GameBoard.style";
import * as mesibotApi from "../../../../../services/mesibotApi";
import { useAppContext } from "../../../../../context/useAppContext";
import { SuccessModal } from "../components/SuccessModal";

interface GussSong {
  songName: string;
  artist: string;
  engLyrics: string[];
  hebLyrics: string[];
}

export const GameBoard = () => {
  const [currentSong, setCurrentSong] = useState<GussSong | null>(null);
  const [showLines, setShowLines] = useState<number>(1);
  const [guess, setGuess] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [songsGuessed, setSongGuessed] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const { party } = useAppContext();

  // TODO: add function that will get user:User as input and will popup the "Button Pressed" Modal

  useEffect(() => {
    // TODO: signEvent to websocket with EventType buttonPressed and attach above function ^ as callback
  }, []);

  useEffect(() => {
    const getSong = async (attempts = 1) => {
      if (attempts > 4) {
        return null;
      }

      const song = await mesibotApi.getSongForGuess(party?._id ?? "");

      if (songsGuessed.includes(song.songName.toLowerCase())) {
        getSong(attempts + 1);
        return;
      }

      setCurrentSong(song);
    };

    if (party?._id) {
      getSong();
    }
  }, [round, party]);

  const handleShowNextLine = () => {
    if (currentSong && showLines < currentSong.hebLyrics.length) {
      setShowLines(showLines + 1);
    }
  };

  const handleGuess = () => {
    if (currentSong && guess.toLowerCase() === currentSong.songName.toLowerCase()) {
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const nextRound = (guessed: boolean) => {
    setRound((prev) => prev + 1);
    setShowLines(1);
    setGuess("");
    setCurrentSong(null);

    if (guessed) {
      setSongGuessed((prev) => {
        if (currentSong) {
          return [...prev, currentSong.songName];
        }

        return prev;
      });
    }

    handleModalClose();
  };

  if (!currentSong) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  const showSkip = showLines === currentSong.hebLyrics.length;
  const showNextButton = showLines < currentSong.hebLyrics.length;

  return (
    <GameBoardContainer>
      <LinesContainer>
        {currentSong?.hebLyrics.map((line, index) => (
          <StyledLine index={index} showLines={showLines} key={index}>
            {line}
          </StyledLine>
        ))}
      </LinesContainer>
      <TextField
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="?מה שם השיר"
        variant="outlined"
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleGuess} edge="start">
                  <ChevronLeftIcon />
                </IconButton>
              </InputAdornment>
            )
          }
        }}
      />
      <ActionsContainer>
        {showNextButton && (
          <NextButton variant="contained" onClick={handleShowNextLine}>
            עוד שורה
          </NextButton>
        )}
        {showSkip && (
          <SkipButton variant="contained" onClick={() => nextRound(false)}>
            דלג
          </SkipButton>
        )}
      </ActionsContainer>
      <SuccessModal
        modalOpen={modalOpen}
        handleModalClose={handleModalClose}
        nextRound={nextRound}
        description="ניחשת נכון את השיר"
      />
    </GameBoardContainer>
  );
};
