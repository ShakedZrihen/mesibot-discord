import { Modal, Box, Typography } from "@mui/material";
import { NextButton } from "../GuessTheSong/GameBoard.style";

interface SuccessModalProps {
  modalOpen: boolean;
  handleModalClose: () => void;
  nextRound: (correct: boolean) => void;
  title?: string;
  description: string;
}

export const SuccessModal = ({
  modalOpen,
  title = "כל הכבוד!",
  description,
  handleModalClose,
  nextRound
}: SuccessModalProps) => {
  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="success-modal"
      aria-describedby="success-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          direction: "rtl",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: "center",
          minWidth: 300
        }}
      >
        <Typography id="success-modal" variant="h6" component="h2" gutterBottom dir="rtl">
          {title}
        </Typography>
        <Typography id="success-modal-description" dir="rtl">
          {description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <NextButton onClick={() => nextRound(true)} variant="contained">
            סיבוב נוסף
          </NextButton>
        </Box>
      </Box>
    </Modal>
  );
};
