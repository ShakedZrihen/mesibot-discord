import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material";
import { StyledSongRow } from "./SongRow.style";
import type { SongRow as SongRowType } from "../types";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Colors } from "../../../consts/colors";
import { useAppContext } from "../../../context/useAppContext";
import { downvoteSong, upvoteSong } from "../../../services/mesibotApi";

interface SongRowProps extends SongRowType {
  onLike?: () => void;
  onDislike?: () => void;
}

export const SongRow = (props: SongRowProps) => {
  const { connectedUser } = useAppContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { number, title, addedBy, _id } = props;

  return (
    <StyledSongRow>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="gray">
          {number}
        </Typography>
        <Box>
          <Typography variant="body1">{title}</Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <IconButton
          sx={{ color: Colors.goodGreen }}
          size="small"
          onClick={() => {
            upvoteSong(_id, connectedUser);
          }}
        >
          <ThumbUpIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          size="small"
          sx={{ color: Colors.vividPink }}
          onClick={() => {
            downvoteSong(_id, connectedUser);
          }}
        >
          <ThumbDownIcon fontSize="inherit" />
        </IconButton>
        <Tooltip title={`Added by ${addedBy.name}`}>
          <Avatar src={addedBy.avatar} sx={{ width: 32, height: 32 }} />
        </Tooltip>
      </Box>
    </StyledSongRow>
  );
};
