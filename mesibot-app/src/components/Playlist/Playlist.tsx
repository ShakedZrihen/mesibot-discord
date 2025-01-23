import { Box, Typography, Avatar, Button } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { SongRow } from "./SongRow/SongRow";
import { SongRow as SongRowType } from "./types";
import { Colors } from "../../consts/colors";
import { downvoteSong, upvoteSong } from "../../services/mesibotApi";
import { useAppContext } from "../../context/useAppContext";

interface PlaylistProps {
  currentSong: SongRowType | null;
  songs: SongRowType[];
}

export const Playlist = ({ currentSong, songs }: PlaylistProps) => {
  const { connectedUser } = useAppContext();

  if (!currentSong) {
    return null;
  }

  return (
    <Box margin="2rem">
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
            <Typography variant="h6">{currentSong.title}</Typography>
            {/* <Typography variant="body2" color="gray">
              {currentSong.artist}
            </Typography> */}
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Button
                onClick={() => {
                  upvoteSong(currentSong._id, connectedUser);
                }}
                startIcon={<ThumbUpIcon />}
                sx={{ color: "white", minWidth: "40px" }}
              >
                {currentSong.upvotes}
              </Button>
              <Button
                onClick={() => {
                  downvoteSong(currentSong._id, connectedUser);
                }}
                startIcon={<ThumbDownIcon />}
                sx={{ color: "white", minWidth: "40px" }}
              >
                {currentSong.downvotes}
              </Button>
              <Typography variant="body2" display="flex" alignItems="center">
                Added by:
                <Avatar src={currentSong.addedBy.avatar} sx={{ width: 24, height: 24, marginLeft: "6px" }} />
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        {songs.map((song) => (
          <SongRow key={song.number} {...song} />
        ))}
      </Box>
    </Box>
  );
};
