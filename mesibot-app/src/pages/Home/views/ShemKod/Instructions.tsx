import { Button, styled } from "@mui/material";
import { Colors } from "../../../../consts/colors";

const PageTitle = styled("h2")`
  direction: rtl;
  font-size: 2rem; // Default font size

  @media (max-width: 600px) {
    font-size: 1.5rem; // Smaller screens (mobile)
  }

  @media (min-width: 1200px) {
    font-size: 3rem; // Larger screens
  }
`;

const Content = styled("p")`
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

const Bold = styled("span")`
  font-weight: bold;
`;

interface InstructionsProps {
  setStarted: (started: boolean) => void;
}

export const Instructions = ({ setStarted }: InstructionsProps) => {
  return (
    <>
      <PageTitle>שם קוד</PageTitle>
      <Content>
        בכל סיבוב תוצג רשימת מילים ובהן <Bold>25 מילים שונות</Bold>, חלקן שייכות לקבוצה שלך וחלקן לקבוצה היריבה.
        <br />
        <Bold>מפעיל הרמזים</Bold> של הקבוצה ייתן רמז המורכב ממילה אחת ומספר.
        <br />
        <br />
        💡 המטרה: לזהות את כל המילים של הצוות שלך לפני היריב!
        <br />
        ❌ אם בוחרים במילה השייכת לקבוצה היריבה – התור עובר אליהם.
        <br />
        ☠️ אם בוחרים במתנקש – הקבוצה מפסידה מיד!
        <br />
        📖 לא בטוחים? תחשבו יחד ותנסו למצוא את הקשר לרמז שניתן.
        <br />
        <Bold>האם תוכלו לפענח את כל המילים לפני שהיריבים יקדימו אתכם?</Bold>
      </Content>
      <Button
        variant="contained"
        sx={{ backgroundColor: Colors.pink, direction: "rtl" }}
        onClick={() => setStarted(true)}
      >
        #יאללה_התחלנו
      </Button>
    </>
  );
};
