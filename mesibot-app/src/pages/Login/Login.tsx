import { LoginButton } from "../../components/GoogleLoginButton/GoogleLoginButton";
import { Topbar } from "../../components/Topbar";
import { styled } from "@mui/material";

const StyledLogin = styled("div")`
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url("/bg.png");
  background-repeat: repeat;
  background-size: auto;
  overflow: hidden;
`;

const StyledButtonContainer = styled("div")`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

export const Login = () => {
  return (
    <StyledLogin>
      <Topbar />
      <StyledButtonContainer>
        <LoginButton />
      </StyledButtonContainer>
    </StyledLogin>
  );
};
