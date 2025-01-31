import { Typography, TextField, Button } from "@mui/material";
import { Colors } from "../../../consts/colors";
import { useState } from "react";
import * as mesibotApi from "../../../services/mesibotApi";
import { useAppContext } from "../../../context/useAppContext";
import { useNavigate } from "react-router-dom";
import { CreatePartyModal } from "./CreatePartyModal";
import { StyledBox, InputContainer } from "./JoinPartyView.style";

export const JoinPartyView = () => {
  const { setParty, connectedUser } = useAppContext();
  const [partyId, setPartyId] = useState("");
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleJoinParty = async () => {
    setError("");
    try {
      if (connectedUser) {
        const party = await mesibotApi.joinParty(partyId, connectedUser);
        setParty(party);
        navigate(`/${partyId}`);
      }
    } catch (error) {
      console.error("❌ Error joining party:", error);
      setError("Unable to join party. Please check the party code and try again.");
    }
  };

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
        onClick={() => setIsCreateModalOpen(true)}
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
      <CreatePartyModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </StyledBox>
  );
};
