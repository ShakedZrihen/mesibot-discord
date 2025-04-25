import { TextField, IconButton, InputAdornment, Box, Modal, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const modalBoxStyle = {
  position: 'absolute',
  top: '10%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: { xs: 260, sm: 500, md: 600 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

export const BuzzerModal = ({
  name,
  avatar,
  clicker = false,
  modalOpen,
  guess = "",
  setGuess = () => {},
  handleGuess = () => {},
}: {
  name: string;
  avatar: string;
  clicker: boolean;
  modalOpen: boolean;
  guess: string;
  setGuess: React.Dispatch<React.SetStateAction<string>>;
  handleGuess?: () => void;
}) => {
  return (
    <Modal open={modalOpen} onClose={() => setGuess("")} disableAutoFocus>
      <Box sx={modalBoxStyle}>
        <img
          src={avatar}
          alt="Avatar"
          style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
        />
        {clicker ? (
          <TextField
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="?מה שם השיר"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton onClick={handleGuess} edge="start">
                    <ChevronLeftIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Typography variant="h5">{name} Has clicked the button!</Typography>
        )}
      </Box>
    </Modal>
  );
};
