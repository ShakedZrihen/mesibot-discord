import { styled, Dialog, DialogTitle, Avatar, Button } from "@mui/material";
import { Colors, MESIBOT_GRADIENT } from "../../consts/colors";

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    backgroundImage: theme.breakpoints.down("sm")
      ? "linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('/bg.png')"
      : "none",
    backgroundRepeat: theme.breakpoints.down("sm") ? "repeat" : "none",
    backgroundSize: theme.breakpoints.down("sm") ? "auto" : "none",
    boxShadow: theme.breakpoints.down("sm") ? "none" : `${Colors.purple} -4px 4px 0px 0px`,
    borderRadius: "0",
    border: theme.breakpoints.down("sm") ? "none" : `1px solid ${Colors.text}`,
    paddingBottom: theme.breakpoints.down("sm") ? "8px" : "16px"
  }
}));

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: theme.breakpoints.down("sm") ? "8px" : "16px"
}));

export const StyledAvatar = styled(Avatar)<{ recording: boolean }>(({ recording }) => ({
  backgroundColor: Colors.white,
  border: `1px solid ${recording ? Colors.pink : Colors.black}`,
  cursor: "pointer"
}));

export const StyledButton = styled(Button)({
  background: MESIBOT_GRADIENT,
  color: Colors.white,
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: Colors.pinkier
  }
});
