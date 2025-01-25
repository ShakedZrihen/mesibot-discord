/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, IconButton, Typography } from "@mui/material";
import { Colors } from "../../consts/colors";
import { StyledAvatar } from "./AddSongModal.style";
import MicIcon from "../../assets/micIcon.svg?react";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

import { useRef, useState } from "react";

interface RecordIntroProps {
  recording: boolean;
  setRecording: (recording: boolean) => void;
  setRecordFile: (file: File | null) => void;
}

export const RecordIntro = ({ recording, setRecordFile }: RecordIntroProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRecording = async () => {};
  const stopRecording = () => {};

  const deleteRecording = () => {
    setAudioURL(null);
    setRecordFile(null);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} marginTop={3}>
      <div
        onClick={recording ? stopRecording : startRecording} // ✅ Single event for mobile/desktop
      >
        <StyledAvatar recording={recording}>
          <MicIcon width={16} color={recording ? Colors.pink : Colors.black} />
        </StyledAvatar>
      </div>

      {/* ✅ Show audio player when recording is done */}
      {audioURL && (
        <Box display="flex" alignItems="center" gap={1}>
          <audio ref={audioRef} src={audioURL} onEnded={() => setIsPlaying(false)} />
          <IconButton onClick={togglePlay} color="primary">
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={deleteRecording} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      )}

      <Box>
        <Typography fontWeight="bold">Record a song introduction.</Typography>
        <Typography variant="body2" color="textSecondary">
          {recording ? "Recording ..." : "The recording will be played before the song starts, so make it count :)"}
        </Typography>
      </Box>
    </Box>
  );
};
