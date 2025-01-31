import { styled } from "@mui/material";
import { isMobileDevice } from "../../../../consts/general";

const Title = styled("h2")`
  text-align: center;
`;

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return isMobileDevice ? (
    <Title>
      Welcome to <br /> {title}
      <br /> Party!
    </Title>
  ) : (
    <Title>Welcome to {title} Party!</Title>
  );
};
