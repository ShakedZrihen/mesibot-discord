import { styled, Toolbar } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import MesibotIcon from "../../assets/mesibot.svg?react";

const StyledAppBar = styled(AppBar)`
  background: linear-gradient(269.98deg, #ffa05b 5.78%, #ef2cdc 68.74%, #2c3fef 102.49%);
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
