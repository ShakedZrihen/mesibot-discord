import { Button } from "@mui/material";
import { Colors } from "../../../../consts/colors";
import { PageTitle, Content, Bold } from "../view.style";

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
