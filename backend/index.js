import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import { initializeDatabase, getRecentStoriesCount, storeNews } from "./utils/db.js";
import { scheduleJob } from "node-schedule";
import { getNews } from "./utils/scrape.js";
import { pool } from "./utils/db.js";
import cors from "cors";

const app = express();
initializeDatabase();

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

app.use(cors());
app.use(express.json());

scheduleJob("* * * * *", async () => {
  try {
    const newsItems = await getNews();
    if (newsItems.length > 0) {
      await storeNews(newsItems);
      broadcast({ type: "update", stories: newsItems });
    }
  } catch (error) {
    console.error("Error fetching news:", error);
  }
});

function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", async (ws) => {
  console.log("Client connected");
  clients.add(ws);

  try {
    const recentCount = await getRecentStoriesCount();
    ws.send(
      JSON.stringify({
        type: "initial",
        recentStoriesCount: recentCount,
      })
    );
  } catch (error) {
    console.error("Error fetching recent stories count:", error);
  }

  const timeout = setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log("Closing idle WebSocket connection");
      ws.close();
    }
  }, 30 * 60 * 1000); // 30 minutes timeout

  // Reset timeout on activity
  ws.on("message", () => {
    clearTimeout(timeout);
  });

  ws.on("close", () => {
    clearTimeout(timeout);
    clients.delete(ws);
  });
});

// REST API to fetch all news
app.get("/news", async (req, res) => {
  try {
    const rows = await pool.execute(
      "SELECT * FROM stories ORDER BY created_at DESC LIMIT 30"
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.get("/", (req, res) => {
  res.json({
    msg: "Scraper",
  });
});

app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
