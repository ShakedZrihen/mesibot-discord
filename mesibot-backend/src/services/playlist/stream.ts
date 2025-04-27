import { ChildProcess } from "child_process";

export let currentSongProcess: ChildProcess | null = null;
export let currentResolve: (() => void) | null = null;

export const setCurrentSongProcess = (songProcess: ChildProcess | null) => {
  currentSongProcess = songProcess;
};

export const setCurrentResolve = (resolve: (() => void) | null) => {
  currentResolve = resolve;
};
