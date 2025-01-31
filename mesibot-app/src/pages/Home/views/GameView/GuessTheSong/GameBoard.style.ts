import { Button, darken, styled } from "@mui/material";
import { Colors } from "../../../../../consts/colors";

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

export const GameBoardContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;
