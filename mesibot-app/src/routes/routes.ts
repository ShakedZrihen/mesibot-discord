import { GuessTheSongView } from "../pages/Home/views/GameView/GuessTheSong/GuessTheSongView";
import { PlaylistView } from "../pages/Home/views/PlaylistView";
import { JoinPartyView } from "../pages/Home/views/JoinPartyView";
import { PartyView } from "../pages/Home/views/PartyView";
import { GameView } from "../pages/Home/views/GameView";
import { BuzzerView } from "../pages/Home/views/BuzzerView";

export interface RouteConfig {
  component: React.ComponentType;
  path: string;
  name: string;
  showPlaylistPicker?: boolean;
}

export const routes: RouteConfig[] = [
  {
    component: JoinPartyView,
    path: "/",
    name: ""
  },
  {
    component: PlaylistView,
    path: "/:partyId/playlist",
    name: "Playlist",
    showPlaylistPicker: true
  },
  {
    component: GameView,
    path: "/:partyId/games",
    name: "Games",
    showPlaylistPicker: true
  },
  {
    component: BuzzerView,
    path: "/:partyId/games/click-the-buzzer",
    name: "Guess the Song",
    showPlaylistPicker: true
  },
  {
    component: PartyView,
    path: "/:partyId",
    name: ""
  },
  {
    component: PlaylistView,
    path: "/playlist",
    name: "Playlist",
    showPlaylistPicker: true
  },

  {
    component: GuessTheSongView,
    path: "/games/guess-the-song",
    name: "Guess the Song",
    showPlaylistPicker: true
  }
];
