import { DialogContent, Autocomplete, TextField, CircularProgress } from "@mui/material";
import { RecordIntro } from "./RecordIntro";
import { Song } from "../../types/playlist";

interface ContentProps {
  isMobile: boolean;
  suggestions: Song[];
  setQuery: (query: string) => void;
  fetchSongs: (searchTerm: string) => void;
  setSelectedSong: (song: Song) => void;
  loading: boolean;
  setRecording: (recording: boolean) => void;
  recording: boolean;
  setRecordFile: (file: File | null) => void;
}

export const Content = ({
  isMobile,
  suggestions,
  setQuery,
  fetchSongs,
  setSelectedSong,
  loading,
  setRecording,
  recording,
  setRecordFile
}: ContentProps) => {
  return (
    <DialogContent sx={{ paddingBottom: isMobile ? "8px" : "16px" }}>
      <Autocomplete
        sx={{ marginTop: "1rem" }}
        freeSolo
        filterOptions={(options) => options}
        options={suggestions}
        getOptionLabel={(option) => (option as Song).title}
        onInputChange={(_, newInputValue) => {
          setQuery(newInputValue);
          fetchSongs(newInputValue);
        }}
        onChange={(_, selectedSong) => setSelectedSong(selectedSong as Song)}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for a song..."
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />

      <RecordIntro recording={recording} setRecording={setRecording} setRecordFile={setRecordFile} />
    </DialogContent>
  );
};
