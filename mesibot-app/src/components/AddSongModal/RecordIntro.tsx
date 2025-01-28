/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Colors } from "../../consts/colors";
import { StyledAvatar } from "./AddSongModal.style";
import MicIcon from "../../assets/micIcon.svg?react";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactAudioPlayer from "react-audio-player";

const MIME_TYPE = "audio/mp4";

interface RecordIntroProps {
  recording: boolean;
  setRecording: (recording: boolean) => void;
  setRecordFile: (file: File | null) => void;
}

export const RecordIntro = ({ recording, setRecording, setRecordFile }: RecordIntroProps) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(audioContext.createGain());

      mediaRecorder.current = new MediaRecorder(stream, { mimeType: MIME_TYPE });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        console.log("Stopping recording...");
        const audioBlob = new Blob(audioChunks.current, { type: MIME_TYPE });
        const file = new File([audioBlob], `recording-${Date.now()}.mp3`, { type: MIME_TYPE });

        setRecordFile(file);
        setAudioURL(URL.createObjectURL(audioBlob));
        audioChunks.current = [];

        // ✅ Stop all tracks properly
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error("❌ Microphone access denied or error occurred:", error);
      alert("Please allow microphone access to record.");
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
    setRecording(false);

    if (mediaRecorder.current) {
      mediaRecorder.current = null;
    }

    audioChunks.current = [];
  };

  return (
    <Box display="flex" alignItems="center" gap={2} marginTop={3}>
      {!audioURL && (
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
      )}

      {audioURL && (
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={deleteRecording} color="error">
            <DeleteIcon />
          </IconButton>
          <ReactAudioPlayer src={audioURL} controls style={{ backgroundColor: "transparent" }} />
        </Box>
      )}

      {!audioURL && (
        <Box>
          <Typography fontWeight="bold">Record a song introduction.</Typography>
          <Typography variant="body2" color="textSecondary">
            {recording ? "Recording ..." : "The recording will be played before the song starts, so make it count :)"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
