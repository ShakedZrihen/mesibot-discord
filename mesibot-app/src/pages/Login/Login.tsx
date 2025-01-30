import { useState } from "react";
import { storage } from "../../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Topbar } from "../../components/Topbar";
import { styled, Box, Button, TextField, Avatar, alpha } from "@mui/material";
import { useAppContext } from "../../context/useAppContext";
import { Colors } from "../../consts/colors";
import { StyledPage } from "../Page.style";

const StyledForm = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: ${alpha(Colors.white, 0.65)};
  border-radius: 8px;
  height: -webkit-fill-available;
  width: 80vw;
  margin: 0 auto;

  @media (min-width: 768px) {
    width: 30vw; /* For tablets and larger screens */
  }
`;

const StyledLoginButton = styled(Button)`
  border-radius: 5rem;
  background: linear-gradient(224.52deg, ${Colors.orange} 14.73%, ${Colors.pink} 91.27%);
  font-weight: bolder;
  box-shadow: none;
  margin-top: 1rem;
`;

export const Login = () => {
  const { login } = useAppContext();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generates a stable avatar URL based on the user's name
  const generateRandomAvatar = (name: string) => {
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${hash}`;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleClearAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleLogin = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    setLoading(true);

    let avatarUrl = generateRandomAvatar(name); // Default if no upload

    // If user uploaded an avatar, upload it to Firebase
    if (avatar) {
      try {
        const storageRef = ref(storage, `avatars/${Date.now()}-${avatar.name}`);
        await uploadBytes(storageRef, avatar);
        avatarUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("❌ Error uploading avatar:", error);
      }
    }

    // Save to LocalStorage
    const userData = { name, avatar: avatarUrl };
    localStorage.setItem("user", JSON.stringify(userData));
    login(userData);

    setLoading(false);
  };

  return (
    <StyledPage>
      <Topbar subtitle="login" />
      <StyledForm>
        <Avatar src={avatarPreview || generateRandomAvatar(name)} sx={{ width: 80, height: 80 }} />
        <TextField
          label="Enter Your Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            component="label"
            sx={{ borderRadius: "5rem", fontWeight: "bolder", boxShadow: "none", background: Colors.pinkier }}
          >
            Upload Avatar
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </Button>
          {avatar && (
            <Button
              variant="contained"
              sx={{
                borderRadius: "5rem",
                fontWeight: "bolder",
                boxShadow: "none",
                background: Colors.orange
              }}
              onClick={handleClearAvatar}
            >
              Clear Avatar
            </Button>
          )}
        </Box>
        <StyledLoginButton variant="contained" color="primary" fullWidth onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </StyledLoginButton>
      </StyledForm>
    </StyledPage>
  );
};
