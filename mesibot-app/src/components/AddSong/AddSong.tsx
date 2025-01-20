import { Fab, styled } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const StyledFab = styled(Fab)`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background-color: #ef2cdc;
  &:hover {
    background-color: #d12aba;
  }
`;

interface AddSongProps {
  onClick: () => void;
}

export const AddSong = ({ onClick }: AddSongProps) => {
  return (
    <StyledFab color="primary" aria-label="add" onClick={onClick}>
      <AddIcon />
    </StyledFab>
  );
};
