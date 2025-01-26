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

export const RecordIntro = ({ recording, setRecording, setRecordFile }: RecordIntroProps) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // ✅ Use webkitAudioContext for Safari (but don't connect to output to prevent echo)
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(audioContext.createGain()); // Do not connect to `destination` (prevents echo)

      mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/mp4" });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp4" });
        const file = new File([audioBlob], `recording-${Date.now()}.mp4`, { type: "audio/mp4" });

        setRecordFile(file);
        setAudioURL(URL.createObjectURL(audioBlob)); // ✅ Assign audio URL after recording
        audioChunks.current = [];

        // ✅ Stop all tracks properly
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error("❌ Error starting recording:", error);
      alert("Failed to start recording. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

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
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
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
