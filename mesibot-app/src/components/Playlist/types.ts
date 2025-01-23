export interface SongRow {
  _id: string;
  number: number;
  image: string;
  title: string;
  artist: string;
  addedBy: { avatar: string; name: string };
  duration: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  rank: number;
}
