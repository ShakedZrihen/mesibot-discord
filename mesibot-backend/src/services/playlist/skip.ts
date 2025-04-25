import { currentResolve, currentSongProcess } from "./stream";

export const skip = () => {
  if (currentSongProcess && currentResolve) {
    console.log("⏭️ Skipping song");
    currentResolve();
  }
};
