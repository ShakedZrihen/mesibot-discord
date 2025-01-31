import { Box, IconButton, ListItem, Modal, styled } from "@mui/material";

export const StyledGameView = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "3vh",
  flexDirection: "column"
});

export const StyledModal = styled(Modal)`
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
`;

export const ModalContent = styled(Box)`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
`;

export const CloseButton = styled(IconButton)`
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 1;
`;

export const StyledListItem = styled(ListItem)`
  border-radius: 8px;
  margin: 8px 0;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    transform: translateX(4px);
    cursor: pointer;
  }
`;
