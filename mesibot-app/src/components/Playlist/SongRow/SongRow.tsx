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
  const { connectedUser, playlistId } = useAppContext();
  const { number, title, addedBy, _id } = props;

  const formatTitle = (title: string) => {
    const pipeIndex = title.indexOf("|");
    const parenthesisIndex = title.indexOf("(");

    if (pipeIndex === -1 && parenthesisIndex === -1) {
      return title;
    }

    if (pipeIndex === -1) {
      return title.substring(0, parenthesisIndex).trim();
    }
    if (parenthesisIndex === -1) {
      return title.substring(0, pipeIndex).trim();
    }

    return title.substring(0, Math.min(pipeIndex, parenthesisIndex)).trim();
  };

  return (
    <StyledSongRow>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="gray">
          {number}
        </Typography>
        <Box>
          <Typography variant="body1">{formatTitle(title)}</Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <IconButton
          sx={{ color: Colors.goodGreen }}
          size="small"
          onClick={() => {
            upvoteSong(_id, connectedUser, playlistId);
          }}
        >
          <ThumbUpIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          size="small"
          sx={{ color: Colors.vividPink }}
          onClick={() => {
            downvoteSong(_id, connectedUser, playlistId);
          }}
        >
          <ThumbDownIcon fontSize="inherit" />
        </IconButton>
        <Tooltip title={`Added by ${addedBy.name}`}>
          <Avatar
            src={addedBy.avatar}
            sx={{ width: 32, height: 32 }}
            slotProps={{ img: { referrerPolicy: "no-referrer" } }}
          />
        </Tooltip>
      </Box>
    </StyledSongRow>
  );
};
