import { GuessTheSongView } from "../GuessTheSong";

export interface Game {
  id: string;
  name: string;
  component: React.ComponentType;
  completed: boolean;
}

export const games: Game[] = [
  {
    id: "guess-the-song",
    name: "Guess the Song",
    component: GuessTheSongView,
    completed: false
  }
  // Add more games here as needed
];
