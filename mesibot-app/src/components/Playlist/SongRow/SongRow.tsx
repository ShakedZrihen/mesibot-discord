import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { StyledSongRow } from "./SongRow.style";
import type { SongRow as SongRowType } from "../types";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Colors } from "../../../consts/colors";

interface SongRowProps extends SongRowType {
  onLike?: () => void;
  onDislike?: () => void;
}

export const SongRow = (props: SongRowProps) => {
  const { number, name, artist, addedBy, duration } = props;

  return (
    <StyledSongRow>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="gray">
          {number}
        </Typography>
        <Box>
          <Typography variant="body1">{name}</Typography>
          <Typography variant="body2" color="gray">
            {artist}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <IconButton sx={{ color: Colors.goodGreen }} size="small">
          <ThumbUpIcon fontSize="inherit" />
        </IconButton>
        <IconButton size="small" sx={{ color: Colors.vividPink }}>
          <ThumbDownIcon fontSize="inherit" />
        </IconButton>
        <Avatar src={addedBy} sx={{ width: 32, height: 32 }} />
        <Typography variant="body2" color="gray">
          {duration}
        </Typography>
      </Box>
    </StyledSongRow>
  );
};
