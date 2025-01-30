import { useState } from "react";
import { guessedSongMock } from "./mock";
import { TextField, Snackbar, IconButton, InputAdornment } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
  ActionsContainer,
  GameBoardContainer,
  LinesContainer,
  NextButton,
  SkipButton,
  StyledLine
} from "./GameBoard.style";

interface GussSong {
  songName: string;
  artist: string;
  engLyrics: string[];
  hebLyrics: string[];
}

export const GameBoard = () => {
  const [currentSong] = useState<GussSong | null>(guessedSongMock);
  const [showLines, setShowLines] = useState<number>(1);
  const [guess, setGuess] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const handleShowNextLine = () => {
    if (currentSong && showLines < currentSong.hebLyrics.length) {
      setShowLines(showLines + 1);
    }
  };

  const handleGuess = () => {
    if (currentSong && guess.toLowerCase() === currentSong.songName.toLowerCase()) {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!currentSong) {
    return null;
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
        placeholder="מה שם השיר?"
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
          <SkipButton variant="contained" onClick={() => setShowLines(currentSong.hebLyrics.length)}>
            דלג
          </SkipButton>
        )}
      </ActionsContainer>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="כל הכבוד! ניחשת נכון"
      />
    </GameBoardContainer>
  );
};
