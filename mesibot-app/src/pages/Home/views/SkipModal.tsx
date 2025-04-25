import { Dialog, DialogContent, Avatar } from "@mui/material";
import { SongRow } from "../../../components/Playlist/types";

interface SkipSongModalProps {
  open: boolean;
  song?: SongRow;
}

const SkipSongModal = ({ open, song }: SkipSongModalProps) => {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          padding: 4,
          background: "white"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              background: "linear-gradient(269.98deg, #FFA05B 5.78%, #EF2CDC 68.74%, #2C3FEF 102.49%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "bounce 1s infinite",
              marginBottom: "1rem"
            }}
          >
            Oh No!
          </p>
          <p
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              background: "linear-gradient(269.98deg, #FFA05B 5.78%, #EF2CDC 68.74%, #2C3FEF 102.49%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "bounce 1s infinite",
              marginBottom: "1rem"
            }}
          >
            {song?.title} was skipped
          </p>
        </div>

        <Avatar
          src={song?.addedBy.avatar}
          alt={song?.addedBy.name}
          sx={{
            width: 80,
            height: 80,
            border: "4px solid #EF2CDC",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "scale(1.1)"
            }
          }}
        >
          {song?.addedBy.name}
        </Avatar>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              background: "linear-gradient(269.98deg, #FFA05B 5.78%, #EF2CDC 68.74%, #2C3FEF 102.49%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Added by {song?.addedBy.name}
          </span>
        </div>

        <p
          style={{
            fontSize: "0.875rem",
            color: "#2C3FEF",
            animation: "fadeIn 0.5s"
          }}
        >
          nice try - next time add a better song!
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SkipSongModal;
