import { useState } from "react";
import { guessedSongMock } from "./mock";
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

interface Group {
  id: string;
  name: string;
  rank: number;
  winningRounds: number[];
}

export const GameBoard = () => {
  const [currentSong, setCurrentSong] = useState<GussSong | null>(guessedSongMock);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGuessingGroup, setCurrentGuessingGroup] = useState<Group | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [scoreBoard, setScoreBoard] = useState<{ [key: string]: number }>({});
  const [showLines, setShowLines] = useState<number>(1);

  const handleShowNextLine = () => {
    if (currentSong && showLines < currentSong.hebLyrics.length) {
      setShowLines(showLines + 1);
    }
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
    </GameBoardContainer>
  );
};
