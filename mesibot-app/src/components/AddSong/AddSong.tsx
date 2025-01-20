import { Fab, styled } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Colors } from "../../consts/colors";

const StyledFab = styled(Fab)`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background-color: ${Colors.pink};
  &:hover {
    background-color: ${Colors.pinkier};
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
