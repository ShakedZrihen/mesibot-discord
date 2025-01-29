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
    path: "/playlist",
    name: "Playlist",
    showPlaylistPicker: true
  }
];
