import { styled, Toolbar } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import MesibotIcon from "../../assets/mesibot.svg?react";
import { MESIBOT_GRADIENT } from "../../consts/colors";

const StyledAppBar = styled(AppBar)`
  background: ${MESIBOT_GRADIENT};
  box-shadow: none;
`;

export const Topbar = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <MesibotIcon />
      </Toolbar>
    </StyledAppBar>
  );
};
