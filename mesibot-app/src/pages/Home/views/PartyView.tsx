import { useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../../context/useAppContext";
import * as mesibotApi from "../../../services/mesibotApi";

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
        console.log({ party });
        setParty(party);
        navigate(`/${params.partyId}/playlist`);
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

  return <div>hello from party</div>;
};
