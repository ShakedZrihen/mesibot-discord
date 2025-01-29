import express from "express";
import cors from "cors";
import { verifyDiscordRequest } from "./middlewares/verifyDiscordRequest";
import { client } from "./clients/discord";
import { DISCORD_TOKEN } from "./env";
import { interactionsRouter } from "./controllers/interactions";
import { apiRouter } from "./controllers/api";
import { initServerPrerequisites } from "./init";
import http from "http";
import WebSocketManager from "./websocket";

const app = express();
const PORT = 3000;

// Create HTTP server
const server = http.createServer(app);
// Initialize WebSocket manager
export const wsManager = new WebSocketManager(server);

app.use(cors());

initServerPrerequisites().then(() => {
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        (req as any).rawBody = buf;
      }
    })
  );

  app.use("/api", apiRouter);
  app.use("/interactions", verifyDiscordRequest, interactionsRouter);

  // Use server.listen instead of app.listen
  server.listen(PORT, () => {
    console.log(`🌍 Web server running at http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server is running`);
  });

  client.once("ready", () => {
    console.log(`🤖 Logged in as ${client.user?.tag}!`);
  });

  client.login(DISCORD_TOKEN);
});
