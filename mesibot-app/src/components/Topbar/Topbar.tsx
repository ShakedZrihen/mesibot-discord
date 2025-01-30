import { useState, useEffect, useCallback } from "react";
import { styled, Toolbar, MenuItem, Select, FormControl } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import MesibotIcon from "../../assets/mesibot.svg?react";
import { Colors, MESIBOT_GRADIENT } from "../../consts/colors";
import { useAppContext } from "../../context/useAppContext";
import { getAvailableParties } from "../../services/mesibotApi";
import { StyledLogoContainer, StyledSubtitle } from "./Topbar.style";
import { Party } from "../../types/party";

const StyledAppBar = styled(AppBar)`
  background: ${MESIBOT_GRADIENT};
  box-shadow: none;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

interface TopbarProps {
  subtitle?: string;
  showPlaylistPicker?: boolean;
}

export const Topbar = ({ subtitle, showPlaylistPicker }: TopbarProps) => {
  const { party, setParty, connectedUser } = useAppContext(); // ✅ Context
  const [parties, setParties] = useState<Party[]>([]);

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
        {connectedUser && showPlaylistPicker && (
          <FormControl variant="standard" sx={{ minWidth: "15vw", marginLeft: "auto" }}>
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
                <MenuItem key={party._id} value={selectedParty}>
                  {party.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};
