import express from "express";
import http from "http";
import dotenv from "dotenv";

import { startWebSocketServer } from "./websocket/websocket.server.js";

dotenv.config();

const app = express();

app.use(express.json());

const server = http.createServer(app);

app.get("/", (_, res) => {
  res.json({
    message: "ChatSphere API"
  });
});

startWebSocketServer(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 HTTP Server : http://localhost:${PORT}`);
});