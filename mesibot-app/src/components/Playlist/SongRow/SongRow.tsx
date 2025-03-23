import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import {
  Avatar,
  Box,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Colors } from "../../../consts/colors";
import { useAppContext } from "../../../context/useAppContext";
import { downvoteSong, upvoteSong } from "../../../services/mesibotApi";
import { formatSongName } from "../../../utils/formatSongName";
import type { SongRow as SongRowType } from "../types";
import { StyledSongRow } from "./SongRow.style";
import {
  ListSwiperItem,
  ListSwiperAction,
  ListSwiperContent,
  Direction,
} from "../../ListSwiper";
import { MouseEventHandler } from "react";

interface SongRowProps extends SongRowType {
  onLike?: () => void;
  onDislike?: () => void;
}

export const SongRow = (props: SongRowProps) => {
  const { connectedUser: user, playlistId, party } = useAppContext();
  const { number, title, addedBy, _id } = props;

  if (!party) return null;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const upvote = () => upvoteSong(party._id, _id, user, playlistId);
  const downvote = () => downvoteSong(party._id, _id, user, playlistId);

  const handleClickVote: MouseEventHandler<HTMLButtonElement> = (e) => {
    const name = e.currentTarget.name;
    name === "like" ? upvote() : downvote();
  };

  const handleSwipeVote = (direction: Direction) => {
    direction === "left" ? downvote() : upvote();
  };

  return (
    <ListSwiperItem onSwipe={handleSwipeVote}>
      <ListSwiperAction direction="left">
        <ThumbUpIcon sx={{ color: Colors.goodGreen }} />
      </ListSwiperAction>
      <ListSwiperContent drag={isMobile}>
        <StyledSongRow>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="gray">
              {number}
            </Typography>
            <Box>
              <Typography variant="body1">{formatSongName(title)}</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              sx={{ color: Colors.goodGreen }}
              size="small"
              name="like"
              onClick={handleClickVote}
            >
              <ThumbUpIcon fontSize="inherit" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: Colors.vividPink }}
              name="dislike"
              onClick={handleClickVote}
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
      </ListSwiperContent>
      <ListSwiperAction direction="right">
        <ThumbDownIcon sx={{ color: Colors.vividPink }} />
      </ListSwiperAction>
    </ListSwiperItem>
  );
};
