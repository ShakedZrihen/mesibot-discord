import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";

interface PlaylistUpdate {
  type: "playlistUpdate";
  payload: {
    songs: any[];
    currentSong: any | null;
  };
}

interface BuzzerClicked {
  type: "buzzerPressed";

  payload: {
    user: {
      name: string, 
      avatar: string
    },
    showModal: boolean
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
    if (!this.partiesConnections.has(partyId)) {
      this.partiesConnections.set(partyId, new Set());
    }

    this.partiesConnections.get(partyId)?.add(ws);
  }

  private removeConnection(partyId: string, ws: WebSocket) {
    this.partiesConnections.get(partyId)?.delete(ws);
    if (this.partiesConnections.get(partyId)?.size === 0) {
      this.partiesConnections.delete(partyId);
    }
  }

  public notifyPlaylistUpdate(partyId: string, songs: any[], currentSong: any | null) {
    const connections = this.partiesConnections.get(partyId);
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


  public notifyBuzzerPressed(partyId: string, user: { name: string, avatar: string}, showModal: boolean) {
    const connections = this.partiesConnections.get(partyId);
    if (!connections) {
      return;
    }

    const update: BuzzerClicked = {
      type: "buzzerPressed",
      payload: { user, showModal }
    };

    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  }
}

export default WebSocketManager;
