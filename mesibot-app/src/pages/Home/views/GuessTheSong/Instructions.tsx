import { Button, styled } from "@mui/material";
import { Colors } from "../../../../consts/colors";

const PageTitle = styled("h2")`
  direction: rtl;
`;

const Content = styled("p")`
  text-align: center;
  margin: 0 2vw 2vw 2vw;
  direction: rtl;
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
      <PageTitle>איזה שיר?</PageTitle>
      <Content>
        בכל סיבוב נציג שורה מתוך <Bold>שיר באנגלית, מתורגמת לעברית</Bold>.
        <br />
        הקבוצה שתלחץ ראשונה על הבאזר תוכל לנסות <Bold>לנחש את שם השיר</Bold>.
        <br />
        <br />
        💡 אם התשובה נכונה – הקבוצה זוכה בנקודות!
        <br />
        ❌ אם טועים – ההזדמנות עוברת לקבוצה היריבה.
        <br />
        📖 לא בטוחים? ניתן לבקש שורה נוספת מהשיר.
        <br />
        <Bold>המטרה:</Bold> לזהות את השיר כמה שיותר מהר ולצבור את מירב הנקודות!
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
