import CloseIcon from "@mui/icons-material/Close";
import { Box, Typography, IconButton } from "@mui/material";
import { StyledDialogTitle } from "./AddSongModal.style";
import HeartSongIcon from "../../assets/heartSong.svg?react";

interface HeaderProps {
  onClose: () => void;
}

export const Header = ({ onClose }: HeaderProps) => {
  return (
    <StyledDialogTitle>
      <Box display="flex" alignItems="center" gap={1}>
        <HeartSongIcon width={30} />
        <Typography variant="h6" fontWeight="300">
          Add a song
        </Typography>
      </Box>
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </StyledDialogTitle>
  );
};
