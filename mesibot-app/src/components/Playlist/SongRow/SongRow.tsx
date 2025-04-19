import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material";
import { StyledSongRow } from "./SongRow.style";
import type { SongRow as SongRowType } from "../types";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Colors } from "../../../consts/colors";
import { useAppContext } from "../../../context/useAppContext";
import { downvoteSong, upvoteSong } from "../../../services/mesibotApi";
import { formatSongName } from "../../../utils/formatSongName";

interface SongRowProps extends SongRowType {
  onLike?: () => void;
  onDislike?: () => void;
  played?: boolean;
}

export const SongRow = (props: SongRowProps) => {
  const { connectedUser, playlistId, party } = useAppContext();
  const { number, title, addedBy, _id, played = false } = props;

  return (
    <StyledSongRow>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="gray">
          {number}
        </Typography>
        <Box>
          <Typography variant="body1" color={played ? "textDisabled" : "textPrimary"}>
            {formatSongName(title)}
          </Typography>
        </Box>
      </Box>

      {!played && (
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            sx={{ color: Colors.goodGreen }}
            size="small"
            onClick={() => {
              upvoteSong(party?._id ?? null, _id, connectedUser, playlistId);
            }}
          >
            <ThumbUpIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: Colors.vividPink }}
            onClick={() => {
              downvoteSong(party?._id ?? null, _id, connectedUser, playlistId);
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
      )}
    </StyledSongRow>
  );
};
