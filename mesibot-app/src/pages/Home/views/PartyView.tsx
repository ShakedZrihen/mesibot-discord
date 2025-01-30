import { useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../../context/useAppContext";
import * as mesibotApi from "../../../services/mesibotApi";
import { Box, Button } from "@mui/material";
import { Colors } from "../../../consts/colors";

export const PartyView = () => {
  const hasJoined = useRef(false);
  const params = useParams();
  const { setParty, connectedUser, party } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const joinPartyFromUrl = async () => {
      if (!params.partyId || !connectedUser || hasJoined.current) {
        return;
      }

      try {
        hasJoined.current = true; // ✅ Mark as joined to prevent multiple calls
        await mesibotApi.joinParty(params.partyId, connectedUser);
        const party = await mesibotApi.getParty(params.partyId);
        setParty(party);
      } catch (error) {
        console.error("❌ Error joining party:", error);
        hasJoined.current = false; // Reset in case of failure
      }
    };

    if (!connectedUser) {
      navigate(`/login`);
      return;
    }

    joinPartyFromUrl();
  }, [params.partyId, setParty, navigate, connectedUser]);

  if (!party) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "3vh",
        flexDirection: "column"
      }}
    >
      <h2>Welcome to {party.title} Party!</h2>
      <Box display="flex" flexDirection="column" gap="0.5rem" marginTop="2vh" padding="1rem">
        <Button
          variant="contained"
          sx={{ borderRadius: "10rem", marginTop: "1vh", backgroundColor: Colors.purple, width: "30vw" }}
          onClick={() => navigate("playlist", { relative: "path" })}
        >
          Playlist
        </Button>
        <Button
          variant="contained"
          sx={{ borderRadius: "10rem", marginTop: "1vh", backgroundColor: Colors.pink, width: "30vw" }}
          onClick={() => navigate("games", { relative: "path" })}
        >
          Games
        </Button>
        <Button
          variant="contained"
          sx={{ borderRadius: "10rem", marginTop: "1vh", backgroundColor: Colors.orange, width: "30vw" }}
          onClick={() => navigate("leaderboard", { relative: "path" })}
        >
          Leaderboard
        </Button>
      </Box>
    </Box>
  );
};
