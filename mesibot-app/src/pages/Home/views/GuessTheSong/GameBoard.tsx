import { useEffect, useState } from "react";
import { TextField, Modal, IconButton, InputAdornment, Box, Typography, CircularProgress } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
  ActionsContainer,
  GameBoardContainer,
  LinesContainer,
  NextButton,
  SkipButton,
  StyledLine
} from "./GameBoard.style";
import * as mesibotApi from "../../../../services/mesibotApi";
import { useAppContext } from "../../../../context/useAppContext";

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
          <SkipButton variant="contained" onClick={() => nextRound(false)}>
            דלג
          </SkipButton>
        )}
      </ActionsContainer>
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="success-modal"
        aria-describedby="success-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            direction: "rtl",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            minWidth: 300
          }}
        >
          <Typography id="success-modal" variant="h6" component="h2" gutterBottom dir="rtl">
            כל הכבוד!
          </Typography>
          <Typography id="success-modal-description" dir="rtl">
            ניחשת נכון את השיר
          </Typography>
          <Box sx={{ mt: 2 }}>
            <NextButton onClick={() => nextRound(true)} variant="contained">
              סיבוב הבא
            </NextButton>
          </Box>
        </Box>
      </Modal>
    </GameBoardContainer>
  );
};
