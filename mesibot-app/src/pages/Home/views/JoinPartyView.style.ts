import { Box, styled } from "@mui/material";

export const StyledBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",
  padding: "2rem",
  height: "100vh"
});

export const InputContainer = styled(Box)({
  display: "flex",
  gap: "1rem",
  width: "100%",
  maxWidth: "500px"
});