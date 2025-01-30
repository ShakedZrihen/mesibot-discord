import { GuessTheSongView } from "../pages/Home/views/GuessTheSong/GuessTheSongView";
import { PlaylistView } from "../pages/Home/views/PlaylistView";

export interface RouteConfig {
  component: React.ComponentType;
  path: string;
  name: string;
  showPlaylistPicker?: boolean;
}

export const routes: RouteConfig[] = [
  {
    component: PlaylistView,
    path: "/",
    name: "Playlist",
    showPlaylistPicker: true
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
