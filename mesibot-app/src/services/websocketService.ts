import { BASE_DOMAIN, BASE_URL } from "../consts/general";

export enum EventTypes {
  PLAYLIST_UPDATE = "playlistUpdate",
  BUZZER_PRESSED = "buzzerPressed",
  SONG_SKIPPED = "songSkipped"
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number = 3000;
  private isConnecting: boolean = false;
  private partyId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private events: { [key: string]: any } = {};

  constructor(partyId: string) {
    this.partyId = partyId;
    this.connect();
  }

  private connect = () => {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(`${BASE_URL.includes("https") ? "wss" : "ws"}://${BASE_DOMAIN}/party/${this.partyId}`);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected!");
        this.isConnecting = false;
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[WS] Message recieved", data);
          const eventHandler = this.events[data.type];
          if (eventHandler) {
            eventHandler(data.payload);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public signEvent = (eventName: string, callback: any) => {
    this.events[eventName] = callback;
  };
}
