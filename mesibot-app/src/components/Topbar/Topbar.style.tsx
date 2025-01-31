import { AppBar, styled } from "@mui/material";
import { MESIBOT_GRADIENT } from "../../consts/colors";

export const StyledLogoContainer = styled("div")`
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
`;

export const StyledSubtitle = styled("span")`
  font-weight: bold;
`;

export const StyledAppBar = styled(AppBar)`
  background: ${MESIBOT_GRADIENT};
  box-shadow: none;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 1000;
`;
