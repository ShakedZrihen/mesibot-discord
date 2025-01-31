import { Router } from "express";
import { getRandomSong } from "./resources/songs-pull";
import { wsManager } from "../../../index";

let ButtonsClicked: string[] | any[] = [];

export const guessTheSongRouter = Router();

guessTheSongRouter.get("/song", async (req, res) => {

  const song = getRandomSong();
  
  res.status(200).send(song);
});

guessTheSongRouter.post("/buzzer", async (req, res) => {
  const { user, partyId } = req.body;

  if(ButtonsClicked.includes(partyId)) {
    console.log("Already Clicked", ButtonsClicked)
    return;
  }
  
  ButtonsClicked.push(partyId);

  wsManager.notifyBuzzerPressed(partyId, user);

  res.sendStatus(200)

  setTimeout(() => {
    const index = ButtonsClicked.indexOf(partyId);
    if (index !== -1) {
      ButtonsClicked.splice(index, 1); // Remove the partyId from the array
      console.log("Updated ButtonsClicked", ButtonsClicked);
    }
  }, 3000);
});
