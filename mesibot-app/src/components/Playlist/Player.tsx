import { useState, useRef } from "react";
import { Box, IconButton, Typography, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PlayArrow, Pause, SkipNext } from "@mui/icons-material";
import { SongRow } from "./types";
import { downvoteSong, play } from "../../services/mesibotApi";
import { useAppContext } from "../../context/useAppContext";

const PlayerWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "#282828",
  padding: theme.spacing(2),
  borderBottom: "1px solid #404040",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  zIndex: 1000,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: theme.spacing(1)
  },
  minHeight: "6rem",
  marginBottom: "2rem",
  borderRadius: "0.5rem"
}));

export const MusicPlayer = ({ currentSong }: { currentSong: SongRow | null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { party, connectedUser, playlistId } = useAppContext();
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamUrl = "https://radio.mesi.bot/listen/kol_hakulz/stream";

  const partyId = party?._id ?? null;

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (!currentSong) {
      play(partyId);
    }

    audioRef.current
      ?.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.error("Playback failed:", err);
      });
  };

  return (
    <PlayerWrapper>
      {/* Left section - Song Info */}
      <Box
        sx={{
          width: { xs: "100%", sm: "40%" },
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" }
        }}
      >
        <Box sx={{ ml: { xs: 0, sm: 2 } }}>
          <Typography variant="subtitle1" sx={{ color: "#fff", textAlign: "center" }}>
            Now Playing
          </Typography>
          {currentSong && (
            <>
              <Typography
                variant="caption"
                sx={{
                  color: "#b3b3b3",
                  textAlign: "center",
                  width: "fit-content"
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {currentSong.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#b3b3b3", textAlign: "center" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                added by {currentSong?.addedBy.name}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Center section - Controls */}
      <Box
        sx={{
          width: { xs: "100%", sm: "40%" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ width: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="large"
              sx={{
                color: "#fff",
                backgroundColor: "#1db954",
                "&:hover": { backgroundColor: "#1ed760" },
                width: 40,
                height: 40
              }}
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "#fff" }}
              onClick={() => {
                downvoteSong(party?._id ?? null, currentSong!._id, connectedUser, playlistId);
              }}
            >
              <SkipNext />
            </IconButton>
          </Box>
          <audio ref={audioRef} src={streamUrl} />
        </Stack>
      </Box>
    </PlayerWrapper>
  );
};
