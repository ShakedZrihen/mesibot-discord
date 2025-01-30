export interface Party {
  _id: string;
  title: string;
  host: {
    name: string;
    avatar: string;
  };
  playlist: {
    _id: string;
    title: string;
    songs: Song[];
    currentPlaying: Song | null;
    queue: Song[];
    played: Song[];
  };
  participants: Participant[];
  games: GameInstance[];
  __v: number;
}

export interface Song {
  // Define properties if needed, assuming a basic structure:
  _id?: string;
  title?: string;
  artist?: string;
  url?: string;
}

export interface Participant {
  _id?: string;
  name: string;
  avatar: string;
  score?: number;
}

export interface GameInstance {
  _id?: string;
  templateId: string;
  title: string;
  maxRounds: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rounds: any[]; // Define a proper type if rounds have a specific structure
  currentRound: number;
  scores: {
    participantId: string;
    score: number;
  }[];
}
