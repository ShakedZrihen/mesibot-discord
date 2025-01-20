import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Avatar,
  useMediaQuery,
  useTheme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "../../assets/micIcon.svg?react";
import { useState } from "react";
import { Colors, MESIBOT_GRADIENT } from "../../consts/colors";

interface AddSongModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddSongModal = ({ open, onClose }: AddSongModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedSong, setSelectedSong] = useState("");
  const [recording, setRecording] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile} // Make it full-screen on mobile
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundImage: isMobile
            ? "linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('/bg.png')"
            : "none",
          backgroundRepeat: isMobile ? "repeat" : "none",
          backgroundSize: isMobile ? "auto" : "none",
          boxShadow: isMobile ? "none" : `${Colors.purple} -4px 4px 0px 0px`,
          borderRadius: "0",
          border: isMobile ? "none" : `1px solid ${Colors.text}`,
          paddingBottom: isMobile ? "8px" : "16px" // Reduce padding for mobile
        }
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: isMobile ? "8px" : "16px" // Reduce bottom padding in mobile
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight="bold">
            Add a song
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent sx={{ paddingBottom: isMobile ? "8px" : "16px" }}>
        {/* Select Song Dropdown */}
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          Select song
        </Typography>
        <Select fullWidth value={selectedSong} onChange={(e) => setSelectedSong(e.target.value)} displayEmpty>
          <MenuItem value="">Select song</MenuItem>
          <MenuItem value="song1">Song 1</MenuItem>
          <MenuItem value="song2">Song 2</MenuItem>
          <MenuItem value="song3">Song 3</MenuItem>
        </Select>

        {/* Record Introduction Section */}
        <Box display="flex" alignItems="center" gap={2} marginTop={3}>
          <div onMouseDown={() => setRecording(true)} onMouseUp={() => setRecording(false)}>
            <Avatar
              sx={{
                bgcolor: Colors.white,
                border: `1px solid ${recording ? Colors.pink : Colors.black}`,
                ":hover": { cursor: "pointer" }
              }}
            >
              <MicIcon width={16} color={recording ? Colors.pink : Colors.black} />
            </Avatar>
          </div>

          <Box>
            <Typography fontWeight="bold">Record a song introduction.</Typography>
            <Typography variant="body2" color="textSecondary">
              The recording will be played before the song starts, so make it count :)
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions sx={{ padding: isMobile ? "12px" : "16px", marginTop: isMobile ? "-8px" : "0px" }}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            background: MESIBOT_GRADIENT,
            color: Colors.white,
            fontWeight: "bold",
            "&:hover": { backgroundColor: Colors.pinkier }
          }}
          onClick={() => {
            console.log("Song Added:", { selectedSong });
            onClose();
          }}
        >
          Add Song
        </Button>
      </DialogActions>
    </Dialog>
  );
};
