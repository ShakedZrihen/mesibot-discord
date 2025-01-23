import express from "express";
import cors from "cors";
import { verifyDiscordRequest } from "./middlewares/verifyDiscordRequest";
import { client } from "./clients/discord";
import { DISCORD_TOKEN } from "./env";
import { interactionsRouter } from "./controllers/interactions";
import { apiRouter } from "./controllers/api";
import { initServerPrerequisites } from "./init";

const app = express();
const PORT = 3000;

app.use(cors());

initServerPrerequisites().then(() => {
  // ✅ Middleware to store raw body before JSON parsing
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        (req as any).rawBody = buf; // Assign raw body without breaking TypeScript
      }
    })
  );

  app.use("/api", apiRouter);

  // Handle Discord interactions
  app.use("/interactions", verifyDiscordRequest, interactionsRouter);

  // Start Express server
  app.listen(PORT, () => {
    console.log(`🌍 Web server running at http://localhost:${PORT}`);
  });

  client.once("ready", () => {
    console.log(`🤖 Logged in as ${client.user?.tag}!`);
  });

  client.login(DISCORD_TOKEN);
});
