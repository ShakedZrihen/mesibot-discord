import { styled } from "@mui/material";

export const PageTitle = styled("h2")`
  direction: rtl;
  font-size: 2rem; // Default font size

  @media (max-width: 600px) {
    font-size: 1.5rem; // Smaller screens (mobile)
  }

  @media (min-width: 1200px) {
    font-size: 3rem; // Larger screens
  }
`;

export const Content = styled("p")`
  text-align: center;
  margin: 0 2vw 2vw 2vw;
  direction: rtl;

  font-size: 1.2rem; // Default font size

  @media (max-width: 600px) {
    font-size: 1rem; // Mobile-friendly text
  }

  @media (min-width: 1200px) {
    font-size: 1.8rem; // Bigger text on large screens
  }
`;

export const Bold = styled("span")`
  font-weight: bold;
`;
