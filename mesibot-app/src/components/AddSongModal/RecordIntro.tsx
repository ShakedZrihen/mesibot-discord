import { Box, Typography } from "@mui/material";
import { Colors } from "../../consts/colors";
import { StyledAvatar } from "./AddSongModal.style";
import MicIcon from "../../assets/micIcon.svg?react";

interface RecordIntroProps {
  recording: boolean;
  setRecording: (recording: boolean) => void;
}

export const RecordIntro = ({ recording, setRecording }: RecordIntroProps) => {
  return (
    <Box display="flex" alignItems="center" gap={2} marginTop={3}>
      <div onMouseDown={() => setRecording(true)} onMouseUp={() => setRecording(false)}>
        <StyledAvatar recording={recording}>
          <MicIcon width={16} color={recording ? Colors.pink : Colors.black} />
        </StyledAvatar>
      </div>

      <Box>
        <Typography fontWeight="bold">Record a song introduction.</Typography>
        <Typography variant="body2" color="textSecondary">
          The recording will be played before the song starts, so make it count :)
        </Typography>
      </Box>
    </Box>
  );
};
