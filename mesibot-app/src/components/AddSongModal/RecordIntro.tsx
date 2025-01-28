/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Colors } from "../../consts/colors";
import { StyledAvatar } from "./AddSongModal.style";
import MicIcon from "../../assets/micIcon.svg?react";
import DeleteIcon from "@mui/icons-material/Delete";

const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
console.log({ isMobileDevice });
const MIME_TYPE = isMobileDevice ? "audio/mp4" : "audio/webm"; // ✅ Use webm instead of mp4
const FILE_EXTENSION = isMobileDevice ? ".mp4" : ".webm";

interface RecordIntroProps {
  recording: boolean;
  setRecording: (recording: boolean) => void;
  setRecordFile: (file: File | null) => void;
}

export const RecordIntro = ({ recording, setRecording, setRecordFile }: RecordIntroProps) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => {
    const askPermissions = async () => {
      try {
        stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Microphone access granted");
      } catch (error) {
        console.error("❌ Microphone access denied or error occurred:", error);
        alert("Please allow microphone access to record.");
      }
    };

    askPermissions();
  }, []);

  const startRecording = async () => {
    if (!stream.current) {
      return;
    }

    try {
      mediaRecorder.current = new MediaRecorder(stream.current, { mimeType: MIME_TYPE });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        if (audioChunks.current.length === 0 || !stream.current) {
          console.error("❌ No audio data was recorded!");
          return;
        }

        console.log("Stopping recording...");
        const audioBlob = new Blob(audioChunks.current, { type: MIME_TYPE });
        const file = new File([audioBlob], `recording-${Date.now()}${FILE_EXTENSION}`, { type: MIME_TYPE });

        setRecordFile(file);
        setAudioURL(URL.createObjectURL(audioBlob));
        audioChunks.current = [];

        stream.current.getTracks().forEach((track) => track.stop());
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
    if (audioURL) {
      URL.revokeObjectURL(audioURL); // ✅ Properly remove the Blob URL
    }
    setAudioURL(null);
    setRecordFile(null);
    setRecording(false);
    audioChunks.current = [];
  };

  const handleClick = () => {
    if (isMobileDevice) return;

    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} marginTop={3}>
      {!audioURL && (
        <div onTouchStart={startRecording} onTouchEnd={stopRecording} onClick={handleClick}>
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

          {/* ✅ Debug with native <audio> before ReactAudioPlayer */}
          <audio key={audioURL} src={audioURL} controls />
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
