import { DialogActions } from "@mui/material";
import debounce from "lodash.debounce";
import { StyledButton } from "./AddSongModal.style";
import { Song } from "../../types/playlist";
import { addSongToPlaylist } from "../../services/mesibotApi";
import { useAppContext } from "../../context/useAppContext";

interface ActionsProps {
  isMobile: boolean;
  selectedSong: Song | null;
  onClose: () => void;
}

export const Actions = ({ isMobile, selectedSong, onClose }: ActionsProps) => {
  const { connectedUser } = useAppContext();

  const handleAddSong = debounce(() => {
    if (!selectedSong) return;

    addSongToPlaylist(selectedSong, { avatar: connectedUser?.avatar ?? "", name: connectedUser?.name ?? "" }).then(
      () => {
        console.log("Song Added:", { selectedSong });
        onClose();
      }
    );
  }, 500);

  return (
    <DialogActions sx={{ padding: isMobile ? "12px" : "16px", marginTop: isMobile ? "-8px" : "0px" }}>
      <StyledButton fullWidth onClick={handleAddSong} disabled={!selectedSong}>
        Add Song
      </StyledButton>
    </DialogActions>
  );
};
