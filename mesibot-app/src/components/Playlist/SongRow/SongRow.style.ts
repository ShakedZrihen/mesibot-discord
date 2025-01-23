import { Box } from "@mui/material";
import { alpha, styled } from "@mui/system";
import { Colors } from "../../../consts/colors";

export const StyledSongRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid ${Colors.veryLightGray};
  color: ${Colors.text};
  background-color: ${alpha(Colors.white, 0.4)};
`;
