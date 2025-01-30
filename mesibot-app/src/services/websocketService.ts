import { Song } from "../types/playlist";

interface PlaylistUpdate {
  songs: Song[];
  currentSong: Song | null;
}

enum EventTypes {
  PLAYLIST_UPDATE = "playlistUpdate"
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number = 3000;
  private isConnecting: boolean = false;
  private playlistId: string;
  private onUpdate: (data: PlaylistUpdate) => void;

  constructor(playlistId: string, onUpdate: (data: PlaylistUpdate) => void) {
    this.playlistId = playlistId;
    this.onUpdate = onUpdate;
    this.connect();
  }

  private connect = () => {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(`ws://localhost:3000/playlist/${this.playlistId}`);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected!");
        this.isConnecting = false;
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === EventTypes.PLAYLIST_UPDATE) {
            this.onUpdate(data.payload);
          }
        } catch (err) {
          console.error("❌ Error parsing WebSocket message:", err);
        }
      };

      this.ws.onerror = (event: Event) => {
        console.error("❌ WebSocket error:", {
          event,
          readyState: this.ws?.readyState,
          url: this.ws?.url
        });
        this.isConnecting = false;
      };

      this.ws.onclose = (event: CloseEvent) => {
        console.warn(`⚠️ WebSocket closed with code ${event.code}. Reconnecting...`);
        this.isConnecting = false;
        setTimeout(this.connect, this.reconnectTimeout);
      };
    } catch (error) {
      console.error("❌ WebSocket connection error:", error);
      this.isConnecting = false;
      setTimeout(this.connect, this.reconnectTimeout);
    }
  };

  public disconnect = () => {
    if (this.ws) {
      this.ws.close();
    }
  };
}
