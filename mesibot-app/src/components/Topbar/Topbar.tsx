import { useState, useEffect, useCallback } from "react";
import { Toolbar, MenuItem, Select, FormControl, Avatar, Menu, IconButton, Box } from "@mui/material";
import MesibotIcon from "../../assets/mesibot.svg?react";
import { Colors } from "../../consts/colors";
import { useAppContext } from "../../context/useAppContext";
import { getAvailableParties } from "../../services/mesibotApi";
import { StyledAppBar, StyledLogoContainer, StyledSubtitle } from "./Topbar.style";
import { Party } from "../../types/party";

interface TopbarProps {
  subtitle?: string;
  showPlaylistPicker?: boolean;
}

export const Topbar = ({ subtitle, showPlaylistPicker }: TopbarProps) => {
  const { party, setParty, connectedUser, logout } = useAppContext(); // ✅ Context
  const [parties, setParties] = useState<Party[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const fetchPlaylists = useCallback(async () => {
    try {
      const data = await getAvailableParties();
      setParties(data);
    } catch (error) {
      console.error("❌ Error fetching playlists:", error);
    }
  }, []);

  useEffect(() => {
    if (!connectedUser) {
      return;
    }

    fetchPlaylists();
  }, [fetchPlaylists, connectedUser]);

  const selectedParty = party ? JSON.stringify(party) : "";

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <StyledLogoContainer>
          <MesibotIcon /> {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
        </StyledLogoContainer>
        <Box sx={{ display: "flex", marginLeft: "auto", gap: 1, alignItems: "center" }}>
          {" "}
          {connectedUser && showPlaylistPicker && (
            <FormControl variant="standard">
              <Select
                value={selectedParty}
                onChange={(e) => setParty(JSON.parse(e.target.value))}
                displayEmpty
                disableUnderline
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
                  color: Colors.white,
                  fontWeight: "bold",
                  width: "auto"
                }}
              >
                {parties.map((party) => (
                  <MenuItem key={party._id} value={JSON.stringify(party)}>
                    {party.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {connectedUser && (
            <Box>
              <IconButton onClick={handleMenuOpen}>
                <Avatar
                  src={connectedUser.avatar}
                  sx={{ width: 25, height: 25 }}
                  slotProps={{ img: { referrerPolicy: "no-referrer" } }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};
