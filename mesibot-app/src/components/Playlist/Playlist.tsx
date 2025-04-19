import { Box } from "@mui/material";
import { SongRow } from "./SongRow/SongRow";
import { SongRow as SongRowType } from "./types";
import { MusicPlayer } from "./Player";

interface PlaylistProps {
  currentSong: SongRowType | null;
  songs: SongRowType[];
}

export const Playlist = ({ currentSong, songs }: PlaylistProps) => {
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
      <MusicPlayer currentSong={currentSong} />
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
