import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";

interface SongSkipped {
  type: "songSkipped";
  payload: {
    song: any;
  };
}
interface PlaylistUpdate {
  type: "playlistUpdate";
  payload: {
    songs: any[];
    currentSong: any | null;
    played: any | null;
  };
}

class WebSocketManager {
  private wss: WebSocketServer;
  private partiesConnections: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    console.log("Setup webSocket");
    this.wss.on("connection", (ws, req) => {
      const partyId = this.getPartyIdFromUrl(req.url);

      if (!partyId) {
        ws.close();
        return;
      }

      this.addConnection(partyId, ws);

      ws.on("close", () => {
        this.removeConnection(partyId, ws);
      });
    });
  }

  private getPartyIdFromUrl(url: string | undefined): string | null {
    if (!url) {
      return null;
    }

    const match = url.match(/\/party\/([^/]+)/);

    return match ? match[1] : null;
  }

  private addConnection(partyId: string, ws: WebSocket) {
    console.log(`[WS] Client requested to connect to party ${partyId}`);
    if (!this.partiesConnections.has(partyId)) {
      this.partiesConnections.set(partyId, new Set());
    }

    this.partiesConnections.get(partyId)?.add(ws);
    console.log(`[WS] Client connected to party ${partyId}. Total: ${this.partiesConnections.get(partyId)?.size}`);
  }

  private removeConnection(partyId: string, ws: WebSocket) {
    this.partiesConnections.get(partyId)?.delete(ws);
    if (this.partiesConnections.get(partyId)?.size === 0) {
      this.partiesConnections.delete(partyId);
    }
  }

  public notifySongSkipped(partyId: string, song: any) {
    const connections = this.partiesConnections.get(partyId);
    console.log(`[WS] Notify ${partyId} song is skipped. Connections: ${connections?.size ?? 0}`);

    if (!connections) {
      return;
    }

    const update: SongSkipped = {
      type: "songSkipped",
      payload: { song }
    };

    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("Updating socket with changes", update);
        client.send(JSON.stringify(update));
      }
    });
  }

  public notifyPlaylistUpdate(partyId: string, songs: any[], currentSong: any | null, played: any | null) {
    const connections = this.partiesConnections.get(partyId);
    console.log(`[WS] Notify ${partyId} update. Connections: ${connections?.size ?? 0}`);

    if (!connections) {
      return;
    }

    const update: PlaylistUpdate = {
      type: "playlistUpdate",
      payload: { songs, currentSong, played }
    };

    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("Updating socket with changes", update);
        client.send(JSON.stringify(update));
      }
    });
  }
}

export default WebSocketManager;
