import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Colors } from "../../../consts/colors";
import * as mesibotApi from "../../../services/mesibotApi";
import { useAppContext } from "../../../context/useAppContext";
import { useNavigate } from "react-router-dom";

interface CreatePartyModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePartyModal = ({ open, onClose }: CreatePartyModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [title, setTitle] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [availableGames, setAvailableGames] = useState<any>([]);
  const [error, setError] = useState("");
  const { setParty, connectedUser } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const getAvailableGames = async () => {
      try {
        const games = await mesibotApi.getAvailableGames();
        setAvailableGames(games);
      } catch (error) {
        console.error("❌ Error fetching available games:", error);
      }
    };

    getAvailableGames();
  }, []);

  const handleCreateParty = async () => {
    if (!title.trim()) {
      setError("Please enter a party title");
      return;
    }

    try {
      if (connectedUser) {
        const party = await mesibotApi.createParty({
          title,
          games: selectedGames,
          host: connectedUser
        });
        setParty(party);
        navigate(`/${party._id}`);
        onClose();
      }
    } catch (error) {
      console.error("❌ Error creating party:", error);
      setError("Unable to create party. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Create New Party
        {isMobile && (
          <Button onClick={onClose} sx={{ minWidth: "auto", p: 0.5 }}>
            ✕
          </Button>
        )}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Party Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth>
          <InputLabel>Games</InputLabel>
          <Select
            multiple
            value={selectedGames}
            onChange={(e) => setSelectedGames(typeof e.target.value === "string" ? [e.target.value] : e.target.value)}
            label="Games"
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Box
                    key={value}
                    component="span"
                    sx={{ bgcolor: Colors.pink, color: "white", px: 1, py: 0.25, borderRadius: 1 }}
                  >
                    {availableGames.find((game: { _id: string; name: string }) => game._id === value)?.name}
                  </Box>
                ))}
              </Box>
            )}
          >
            {availableGames.map((game: { _id: string; name: string }) => (
              <MenuItem key={game._id} value={game._id}>
                {game.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {isMobile && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleCreateParty}
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: Colors.pink,
                "&:hover": {
                  backgroundColor: Colors.pinkier
                }
              }}
            >
              Create
            </Button>
          </Box>
        )}
      </DialogContent>
      {!isMobile && (
        <DialogActions>
          <Button onClick={onClose} sx={{ color: Colors.pink }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateParty}
            variant="contained"
            sx={{
              backgroundColor: Colors.pink,
              "&:hover": {
                backgroundColor: Colors.pinkier
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
