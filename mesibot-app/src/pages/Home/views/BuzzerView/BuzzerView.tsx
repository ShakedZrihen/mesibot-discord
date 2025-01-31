import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from "@mui/material";
import { useEffect, useRef, useState, MouseEvent } from "react";
import { BuzzerButton } from "./BuzzerButton";

import { useAppContext } from "../../../../context/useAppContext";


const StyledContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20vh;
`;

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

export function BuzzerView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [lastBuzzerId, setLastBuzzerId] = useState('');
  const [lastBuzzerAvatar, setLastBuzzerAvatar] = useState('');
  const [selectedColorValue, setSelectedColorValue] = useState("#ff0000");

  const { connectedUser } = useAppContext();


  const audio = useRef<HTMLAudioElement | null>(null);

  const handleModalClose = (
    e: MouseEvent<HTMLDivElement>,
    reason: 'escapeKeyDown' | 'backdropClick'
  ) => {
    if (reason === 'backdropClick') {
      e.preventDefault();
      return;
    }
    setModalOpen(false);
  };

  useEffect(() => {
    audio.current = new Audio("../../../../../public/yay.mp3");
  }, []);

  const handlePlay = () => {
    if (audio.current) {
      audio.current.play();
      setLastBuzzerId(`${connectedUser?.name || "unknown user"}`); 
      setLastBuzzerAvatar(connectedUser?.avatar || "")
      setTimeout(() => setModalOpen(true), 100);
    }
  };

  const colors = {
    red: "#FF0000",
    blue: "#1976D2",
    purple: "#9e42f5",
    yellow: "#e3f542",
    orane: "#f58142",
    green: "#60f542",
  }

  return (
    <StyledContainer>

      <BuzzerButton selectedColorValue={colors.red} onPlay={handlePlay} />
      
      <Modal open={modalOpen} onClose={handleModalClose} disableAutoFocus>
        <Box sx={modalBoxStyle}>
          <img
            src={lastBuzzerAvatar}
            alt="Avatar"
            style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
          />
          <Typography variant="h5">{lastBuzzerId} has buzzed in!</Typography>
          <Button onClick={() => setModalOpen(false)} className="mt-6">
            Close
          </Button>
        </Box>
      </Modal>
    </StyledContainer>
  );
}
