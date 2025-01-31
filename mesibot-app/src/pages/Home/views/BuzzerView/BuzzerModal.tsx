import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useAppContext } from "../../../../context/useAppContext";
import { useState, MouseEvent } from 'react'

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

export const BuzzerModal = () => {
      const [modalOpen, setModalOpen] = useState(false);
      const [lastBuzzerId, setLastBuzzerId] = useState('');
      const [lastBuzzerAvatar, setLastBuzzerAvatar] = useState('');
      const { connectedUser } = useAppContext();

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


      setLastBuzzerId(`${connectedUser?.name || "unknown user"}`); 
      setLastBuzzerAvatar(connectedUser?.avatar || "")
      setTimeout(() => setModalOpen(true), 100);

      return (
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
      )
}
