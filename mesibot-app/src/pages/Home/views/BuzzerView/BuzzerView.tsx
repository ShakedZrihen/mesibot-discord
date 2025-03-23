
import { styled } from "@mui/material";
import { useEffect, useRef} from "react";
import { BuzzerButton } from "./BuzzerButton";
import { Colors } from "../../../../consts/colors";

const StyledContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20vh;
`;


export function BuzzerView({ small = false }: { small?: boolean }) {

  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audio.current = new Audio("../../../../../public/yay.mp3");
  }, []);

  const handlePlay = () => {
    if (audio.current) {
      audio.current.play();
      
    }
  };

  return (
    <StyledContainer>
      <BuzzerButton selectedColorValue={Colors.pinkier} onPlay={handlePlay} small={small} />
    </StyledContainer>
  );
}
