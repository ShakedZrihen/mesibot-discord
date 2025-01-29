import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";

interface PlaylistUpdate {
  type: "playlistUpdate";
  payload: {
    songs: any[];
    currentSong: any | null;
  };
}

class WebSocketManager {
  private wss: WebSocketServer;
  private playlistConnections: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    console.log("Setup webSocket");
    this.wss.on("connection", (ws, req) => {
      const playlistId = this.getPlaylistIdFromUrl(req.url);

      if (!playlistId) {
        ws.close();
        return;
      }

      this.addConnection(playlistId, ws);

      ws.on("close", () => {
        this.removeConnection(playlistId, ws);
      });
    });
  }

  private getPlaylistIdFromUrl(url: string | undefined): string | null {
    if (!url) return null;
    const match = url.match(/\/playlist\/([^/]+)/);
    return match ? match[1] : null;
  }

  private addConnection(playlistId: string, ws: WebSocket) {
    if (!this.playlistConnections.has(playlistId)) {
      this.playlistConnections.set(playlistId, new Set());
    }
    this.playlistConnections.get(playlistId)?.add(ws);
  }

  private removeConnection(playlistId: string, ws: WebSocket) {
    this.playlistConnections.get(playlistId)?.delete(ws);
    if (this.playlistConnections.get(playlistId)?.size === 0) {
      this.playlistConnections.delete(playlistId);
    }
  }

  public notifyPlaylistUpdate(playlistId: string, songs: any[], currentSong: any | null) {
    const connections = this.playlistConnections.get(playlistId);
    if (!connections) {
      return;
    }

    const update: PlaylistUpdate = {
      type: "playlistUpdate",
      payload: { songs, currentSong }
    };

    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  }
}

export default WebSocketManager;
