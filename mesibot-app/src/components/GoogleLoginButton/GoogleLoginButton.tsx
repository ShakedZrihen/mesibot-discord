import { auth, googleProvider } from "../../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { styled } from "@mui/material";
import { Colors } from "../../consts/colors";
import { useAppContext } from "../../context/useAppContext";

const StyledButton = styled("button")`
  background: ${Colors.pinkier};
  color: white;
  padding: 10px 20px;
  font-size: 1.2rem;
  border: none;
  font-weight: bold;
`;

export const LoginButton = () => {
  const { login } = useAppContext();

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = {
        name: result.user.displayName || "",
        email: result.user.email || "",
        avatar: result.user.photoURL || ""
      };

      login(userData);
    } catch (error) {
      console.error("❌ Login failed:", error);
    }
  };

  return <StyledButton onClick={loginWithGoogle}>Login with Google</StyledButton>;
};
