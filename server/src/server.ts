import express from "express";
import http from "http";
import dotenv from "dotenv";

import { connectDatabase } from "./config/db.js";
import { startWebSocketServer } from "./websocket/websocket.server.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

const server = http.createServer(app);

app.get("/", (_, res) => {
  res.json({
    message: "ChatSphere API",
  });
});

startWebSocketServer(server);

await connectDatabase();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 HTTP Server : http://localhost:${PORT}`);
});