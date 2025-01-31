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

export const PageTitle = styled("h2")`
  direction: rtl;
  font-size: 2rem; // Default font size

  @media (max-width: 600px) {
    font-size: 1.5rem; // Smaller screens (mobile)
  }

  @media (min-width: 1200px) {
    font-size: 3rem; // Larger screens
  }
`;

export const Content = styled("p")`
  text-align: center;
  margin: 0 2vw 2vw 2vw;
  direction: rtl;

  font-size: 1.2rem; // Default font size

  @media (max-width: 600px) {
    font-size: 1rem; // Mobile-friendly text
  }

  @media (min-width: 1200px) {
    font-size: 1.8rem; // Bigger text on large screens
  }
`;

export const Bold = styled("span")`
  font-weight: bold;
`;
