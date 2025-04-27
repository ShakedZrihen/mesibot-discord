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

interface SongRowProps extends SongRowType {
  onLike?: () => void;
  onDislike?: () => void;
  played?: boolean;
}

export const SongRow = (props: SongRowProps) => {
  const { connectedUser, playlistId, party } = useAppContext();
  const { number, title, addedBy, _id, played = false } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  if (!party) return null;

  const upvote = () => upvoteSong(party._id, _id, connectedUser, playlistId);
  const downvote = () => downvoteSong(party._id, _id, connectedUser, playlistId);

  const handleSwipe = (direction: Direction) => {
    if(direction === "left") {
      downvote()
    } else {
      upvote()
    }
  };
  return (
    <ListSwiperItem onSwipe={handleSwipe}>
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
          <Typography variant="body1" color={played ? "textDisabled" : "textPrimary"}>
          <span style={{ fontWeight: 700 }}>{addedBy.name}{">"}</span> {formatSongName(title)}
          </Typography>
        </Box>
      </Box>

      {!played && (<Box display="flex" alignItems="center" gap={2}>
        <IconButton
          sx={{ color: Colors.goodGreen }}
          size="small"
          onClick={() => upvote()}
        >
          <ThumbUpIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          size="small"
          sx={{ color: Colors.vividPink }}
          onClick={() => upvote()}
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
      </Box>)}
    </StyledSongRow>
    </ListSwiperContent>
      <ListSwiperAction direction="right">
        <ThumbDownIcon sx={{ color: Colors.vividPink }} />
      </ListSwiperAction>
    </ListSwiperItem>


  );
};
