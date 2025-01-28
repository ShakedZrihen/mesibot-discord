import { useState, useEffect, useCallback } from "react";
import { styled, Toolbar, MenuItem, Select, FormControl } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import MesibotIcon from "../../assets/mesibot.svg?react";
import { Colors, MESIBOT_GRADIENT } from "../../consts/colors";
import { useAppContext } from "../../context/useAppContext";
import { getAvailablePlaylists } from "../../services/mesibotApi";

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

export const Topbar = () => {
  const { setPlaylist, playlistId, connectedUser } = useAppContext(); // ✅ Context
  const [playlists, setPlaylists] = useState<{ title: string; id: string }[]>([]);

  const fetchPlaylists = useCallback(async () => {
    try {
      const data = await getAvailablePlaylists();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPlaylists(data?.map(({ _id, title }: any) => ({ id: _id, title })) || []);
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

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <MesibotIcon />
        {connectedUser && (
          <FormControl variant="standard" sx={{ minWidth: "15vw", marginLeft: "auto" }}>
            <Select
              value={playlistId || ""} // ✅ Ensure controlled component
              onChange={(e) => setPlaylist(e.target.value)} // ✅ Correctly update state
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
              {playlists.map((playlist) => (
                <MenuItem key={playlist.id} value={playlist.id}>
                  {playlist.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};
