import { GuessTheSongView } from "../pages/Home/views/GuessTheSong/GuessTheSongView";
import { PlaylistView } from "../pages/Home/views/PlaylistView";
import { JoinPartyView } from "../pages/Home/views/JoinPartyView";

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
    component: JoinPartyView,
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
