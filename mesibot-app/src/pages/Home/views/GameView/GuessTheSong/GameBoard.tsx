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
import { EventTypes } from "../../../../../services/websocketService";
import { BuzzerView } from '../../BuzzerView/BuzzerView';
import { BuzzerModal } from '../../BuzzerView/BuzzerModal';

interface GussSong {
  songName: string;
  artist: string;
  engLyrics: string[];
  hebLyrics: string[];
}

type User = {
  user: {
    name: string;
    avatar: string;
  }
};
type Clicker = {
  name: string;
  avatar: string;
  
};

export const GameBoard = () => {
  const [currentSong, setCurrentSong] = useState<GussSong | null>(null);
  const [showLines, setShowLines] = useState<number>(1);
  const [guess, setGuess] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [BuzzermodalOpen, setBuzzermodalOpen] = useState<boolean>(false);

  const [songsGuessed, setSongGuessed] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const { party, websocketService, connectedUser } = useAppContext();

  const [clicker, setClicker] = useState<Clicker | null>(null);
  
  // TODO: add function that will get user:User as input and will popup the "Button Pressed" Modal

  console.log("connectedUser", connectedUser)
  const BuzzerClicked = (user: User) => {
    console.log("Clicked By", user.user.name)
    if(!user) {
      return;
    }
    setBuzzermodalOpen(true);
    setClicker(user.user)
  };
  useEffect(() => {

    if (!party?._id) {
      return;
    }

    websocketService?.signEvent(EventTypes.BUZZER_PRESSED, BuzzerClicked);
  }, [party, websocketService]);

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
      nextRound(true)
    }
    nextRound(false)
    setBuzzermodalOpen(false);
    handleModalClose();
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
      {
        BuzzermodalOpen && clicker ? (
          clicker.name === connectedUser?.name ? (
              <BuzzerModal
                name={clicker.name}
                avatar={clicker.avatar}
                clicker={true}
                guess={guess}
                modalOpen={BuzzermodalOpen}
                setGuess={setGuess}
                handleGuess={handleGuess}
              />
          ) : (
              <BuzzerModal
                name={clicker.name}
                avatar={clicker.avatar}
                clicker={false}
                guess={guess}
                modalOpen={BuzzermodalOpen}
                setGuess={setGuess}
                handleGuess={handleGuess}
              />
            // <div>
            //   <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            //   </Box>
            // </div>
  
          )
        ) : null
      }

      <LinesContainer>
      {currentSong?.hebLyrics.map((line, index) => (
        <StyledLine index={index} showLines={showLines} key={index}>
          {line}
        </StyledLine>
      ))}
      </LinesContainer>
      <BuzzerView small={true}/>

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
