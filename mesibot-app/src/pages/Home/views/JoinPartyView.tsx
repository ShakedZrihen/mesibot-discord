import { Box, Typography, TextField, Button } from "@mui/material";
import { Colors } from "../../../consts/colors";
import { styled } from "@mui/material/styles";
import { useState, useEffect, useRef } from "react";
import * as mesibotApi from "../../../services/mesibotApi";
import { useAppContext } from "../../../context/useAppContext";
import { useNavigate, useParams } from "react-router-dom";

const StyledBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px); // Subtract Topbar height
  padding: 2rem;
  gap: 2rem;
`;

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 500px;

  ${({ theme }) => theme.breakpoints.up("sm")} {
    flex-direction: row;
  }
`;

export const JoinPartyView = () => {
  const { setParty, connectedUser } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [partyId, setPartyId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const params = useParams();

  // ✅ Prevent multiple joins using a ref
  const hasJoined = useRef(false);

  useEffect(() => {
    const joinPartyFromUrl = async () => {
      if (!params.partyId || !connectedUser || hasJoined.current) {
        setLoading(false);
        return;
      }

      try {
        hasJoined.current = true; // ✅ Mark as joined to prevent multiple calls
        await mesibotApi.joinParty(params.partyId, connectedUser);
        const party = await mesibotApi.getParty(params.partyId);
        setParty(party);
        navigate(`/${params.partyId}/playlist`);
      } catch (error) {
        console.error("❌ Error joining party:", error);
        setError("Unable to join party. Please check the party code and try again.");
        setLoading(false);
        hasJoined.current = false; // Reset in case of failure
      }
    };

    if (!connectedUser) {
      navigate(`/login`);
      return;
    }

    joinPartyFromUrl();
  }, [params.partyId, setParty, navigate, connectedUser]);

  const handleJoinParty = async () => {
    setError("");

    if (!partyId.trim() || hasJoined.current) return; // ✅ Prevent multiple clicks

    try {
      hasJoined.current = true; // ✅ Mark as joined
      if (connectedUser) {
        await mesibotApi.joinParty(partyId, connectedUser);
      }
      const party = await mesibotApi.getParty(partyId);
      setParty(party);
      navigate(`/${partyId}/playlist`);
    } catch (error) {
      console.error("❌ Error joining party:", error);
      setError("Unable to join party. Please check the party code and try again.");
      hasJoined.current = false; // Reset in case of failure
    }
  };

  if (loading) {
    return null;
  }

  return (
    <StyledBox>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          textAlign: "center",
          "& br": {
            display: { xs: "block", sm: "none" }
          }
        }}
      >
        Welcome <br />
        to <br />
        Mesibot!
      </Typography>
      <InputContainer>
        <TextField
          fullWidth
          placeholder="Enter party code"
          variant="outlined"
          value={partyId}
          onChange={(e) => setPartyId(e.target.value)}
          error={!!error}
          helperText={error}
        />
        <Button
          variant="contained"
          onClick={handleJoinParty}
          sx={{
            backgroundColor: Colors.pink,
            "&:hover": {
              backgroundColor: Colors.pinkier
            },
            whiteSpace: "nowrap"
          }}
        >
          Join Party
        </Button>
      </InputContainer>
      <Button
        variant="outlined"
        sx={{
          borderColor: Colors.pink,
          color: Colors.pink,
          "&:hover": {
            borderColor: Colors.pinkier,
            color: Colors.pinkier
          }
        }}
      >
        Create Party
      </Button>
    </StyledBox>
  );
};
