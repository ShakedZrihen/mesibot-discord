import { useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { StyledDialog } from "./AddSongModal.style";
import * as mesibotApi from "../../services/mesibotApi";
import { Header } from "./Header";
import { Content } from "./Content";
import { Actions } from "./Actions";
import { Song } from "../../types/playlist";

interface AddSongModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddSongModal = ({ open, onClose }: AddSongModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [, setRecordFile] = useState<File | null>(null);

  const fetchSongs = async (searchTerm: string) => {
    if (searchTerm.length < 3) {
      return;
    }

    setLoading(true);
    try {
      const response = await mesibotApi.searchSongs(searchTerm);
      setSuggestions(response);
    } catch (error) {
      console.error("❌ Error fetching songs:", error);
    }
    setLoading(false);
  };

  return (
    <StyledDialog open={open} onClose={onClose} fullScreen={isMobile} maxWidth="sm" fullWidth>
      <Header onClose={onClose} />

      <Content
        recording={recording}
        setRecording={setRecording}
        loading={loading}
        setSelectedSong={setSelectedSong}
        fetchSongs={fetchSongs}
        setQuery={setQuery}
        suggestions={suggestions}
        isMobile={isMobile}
        setRecordFile={setRecordFile}
      />

      <Actions isMobile={isMobile} selectedSong={selectedSong} onClose={onClose} />
    </StyledDialog>
  );
};
