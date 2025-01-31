import { useState } from "react";
import { List, ListItemIcon, ListItemText, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { StyledListItem, StyledModal, ModalContent, CloseButton, StyledGameView } from "./GameView.style";
import { Game, games } from "./games";
import { useAppContext } from "../../../../context/useAppContext";

export const GameView = () => {
  const { party } = useAppContext();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
  };

  const handleClose = () => {
    setSelectedGame(null);
  };

  const GameComponent = selectedGame?.component;

  return (
    <StyledGameView>
      <Typography variant="h4" gutterBottom>
        {party?.title}
      </Typography>
      
      <List>
        {games.map((game) => (
          <StyledListItem key={game.id} onClick={() => handleGameClick(game)}>
            <ListItemIcon>
              <SportsEsportsIcon />
            </ListItemIcon>
            <ListItemText primary={game.name} />
            {game.completed && <CheckCircleIcon color="success" sx={{ marginLeft: 1 }} />}
          </StyledListItem>
        ))}
      </List>

      <StyledModal open={!!selectedGame} onClose={handleClose}>
        <ModalContent>
          <CloseButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </CloseButton>
          {GameComponent && <GameComponent />}
        </ModalContent>
      </StyledModal>
    </StyledGameView>
  );
};
