import { Box, Typography } from "@mui/material";
import { SongRow } from "./SongRow/SongRow";
import { SongRow as SongRowType } from "./types";
import { MusicPlayer } from "./Player";

interface PlaylistProps {
  currentSong: SongRowType | null;
  songs: SongRowType[];
  playedSongs: SongRowType[];
}

export const Playlist = ({ currentSong, songs, playedSongs }: PlaylistProps) => {
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
      <Typography variant="h6" style={{ margin: "1rem 0" }}>
        Next Songs
      </Typography>
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
      <Typography variant="h6" style={{ margin: "1rem 0" }}>
        History
      </Typography>
      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          WebkitOverflowScrolling: "touch",
          paddingBottom: { xs: "2rem", sm: "1rem" } // Added padding at the bottom
        }}
      >
        {playedSongs.map((song) => (
          <SongRow key={song.number} {...song} played/>
        ))}
      </Box>
    </Box>
  );
};
