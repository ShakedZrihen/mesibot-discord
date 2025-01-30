import { DialogActions } from "@mui/material";
import { StyledButton } from "./AddSongModal.style";
import { Song } from "../../types/playlist";
import { addSongToPlaylist } from "../../services/mesibotApi";
import { useAppContext } from "../../context/useAppContext";
import { uploadRecording } from "../../services/firebase";

interface ActionsProps {
  isMobile: boolean;
  selectedSong: Song | null;
  recordFile: File | null;
  onClose: () => void;
}

export const Actions = ({ isMobile, selectedSong, recordFile, onClose }: ActionsProps) => {
  const { connectedUser, playlistId, party } = useAppContext();

  const handleAddSong = async () => {
    if (!selectedSong) {
      return;
    }

    let recordUrl = null;
    if (recordFile) {
      recordUrl = await uploadRecording(recordFile);
    }

    await addSongToPlaylist(
      party?._id ?? "",
      { song: selectedSong, introUrl: recordUrl },
      { avatar: connectedUser?.avatar ?? "", name: connectedUser?.name ?? "" },
      playlistId
    );

    onClose();
  };

  return (
    <DialogActions sx={{ padding: isMobile ? "12px" : "16px", marginTop: isMobile ? "-8px" : "0px" }}>
      <StyledButton fullWidth onClick={handleAddSong} disabled={!selectedSong}>
        Add Song
      </StyledButton>
    </DialogActions>
  );
};
