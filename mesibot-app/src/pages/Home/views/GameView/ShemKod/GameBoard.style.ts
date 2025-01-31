import { Box, Button, darken, Paper, styled } from "@mui/material";
import { Colors } from "../../../../../consts/colors";
import { Groups } from "./types";

export const StyledLine = styled("div")<{ showLines: number; index: number }>`
  font-size: 24px;
  filter: ${({ index, showLines }) => (index >= showLines ? "blur(5px)" : "none")};
  transition: "filter 0.3s ease";
  direction: rtl;
  text-align: right;
`;

export const LinesContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const NextButton = styled(Button)`
  margin-top: 2rem;
  background-color: ${Colors.pink};

  cursor: pointer;

  &:hover {
    background-color: ${darken(Colors.pink, 0.2)};
  }
`;

export const SkipButton = styled(NextButton)`
  background-color: ${Colors.vividPink};

  &:hover {
    background-color: ${darken(Colors.vividPink, 0.2)};
  }
`;

export const ActionsContainer = styled("div")`
  display: flex;
  gap: 16px;
`;

export const GameBoardContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80vw;
  height: 80vh;
  gap: 2rem; // 2rem space between rows
`;

export const RowContainer = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 2rem; // 2rem padding between cards
  width: 100%;
`;

export const WordCard = styled(Paper)<{ group: number | "neutral" | "hidden" }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18%; // Makes sure 5 cards fit in a row
  height: 100px; // Bigger cards
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
  transition: 0.2s;
  cursor: pointer;
  font-size: 1.2rem;
  background-color: ${({ group }) =>
    group === "hidden"
      ? Colors.veryLightGray // Gray hidden color in host mode
      : group === Groups.Red
      ? Colors.lightRed // Red for group 1
      : group === Groups.Blue
      ? Colors.lightBlue // Blue for group 2
      : Colors.neutral}; // Neutral color

  &:hover {
    filter: brightness(90%);
  }
`;

export const StyledLoader = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh"
});
