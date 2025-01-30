import { Box, Typography, Avatar, Button } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { SongRow } from "./SongRow/SongRow";
import { SongRow as SongRowType } from "./types";
import { Colors } from "../../consts/colors";
import { downvoteSong, upvoteSong } from "../../services/mesibotApi";
import { useAppContext } from "../../context/useAppContext";
import { formatSongName } from "../../utils/formatSongName";

interface PlaylistProps {
  currentSong: SongRowType | null;
  songs: SongRowType[];
}

export const Playlist = ({ currentSong, songs }: PlaylistProps) => {
  const { connectedUser, playlistId, party } = useAppContext();

  const partyId = party?._id ?? null;

  return (
    <Box
      sx={{
        margin: { xs: "1rem", sm: "2rem" },
        marginBottom: { xs: "5rem", sm: "2rem" }, // Added extra margin for mobile to see last song
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "calc(100vh - 64px)" // Subtract the height of Topbar
      }}
    >
      {currentSong && (
        <Box
          sx={{
            backgroundColor: Colors.mostlyBlack,
            padding: "16px",
            borderRadius: "8px",
            color: "white",
            marginBottom: "16px"
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box>
              <Typography variant="h6">{formatSongName(currentSong.title)}</Typography>
              {/* <Typography variant="body2" color="gray">
              {currentSong.artist}
            </Typography> */}
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Button
                  onClick={() => {
                    upvoteSong(partyId, currentSong._id, connectedUser, playlistId);
                  }}
                  startIcon={<ThumbUpIcon />}
                  sx={{ color: "white", minWidth: "40px" }}
                >
                  {currentSong.upvotes}
                </Button>
                <Button
                  onClick={() => {
                    downvoteSong(partyId, currentSong._id, connectedUser, playlistId);
                  }}
                  startIcon={<ThumbDownIcon />}
                  sx={{ color: "white", minWidth: "40px" }}
                >
                  {currentSong.downvotes}
                </Button>
                <Typography variant="body2" display="flex" alignItems="center">
                  Added by:
                  <Avatar
                    src={currentSong.addedBy.avatar}
                    sx={{ width: 24, height: 24, marginLeft: "6px" }}
                    slotProps={{ img: { referrerPolicy: "no-referrer" } }}
                  />
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          WebkitOverflowScrolling: "touch",
          paddingBottom: { xs: "2rem", sm: "1rem" } // Added padding at the bottom
        }}
      >
        {songs.map((song) => (
          <SongRow key={song.number} {...song} />
        ))}
      </Box>
    </Box>
  );
};
