import { BuzzerView } from "../BuzzerView";
import { GuessTheSongView } from "./GuessTheSong";
import { ShemKodView } from "./ShemKod";

export interface Game {
  id: string;
  name: string;
  component: React.ComponentType;
  completed: boolean;
}

export const games: Game[] = [
  {
    id: "guess-the-song",
    name: "?איזה שיר",
    component: GuessTheSongView,
    completed: false
  },
  {
    id: "shemkod",
    name: "שם קוד",
    component: ShemKodView,
    completed: false
  },
  {
    id: "click-the-buzzer",
    name: "באזר",
    component: BuzzerView,
    completed: false
  }
  // Add more games here as needed
];
