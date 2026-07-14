import express from "express";
import http from "http";
import dotenv from "dotenv";

import { connectDatabase } from "./config/db.js";
import { startWebSocketServer } from "./websocket/websocket.server.js";
import authRoutes from "./routes/auth.routes.js";
import path from "path";
import uploadRoutes from "./routes/upload.routes.js";
import multer from "multer";
dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use(
  "/uploads",
  express.static(path.resolve("uploads"))
);

app.use(
  "/api/upload",
  uploadRoutes
);
const server = http.createServer(app);

app.get("/", (_, res) => {
  res.json({
    message: "ChatSphere API",
  });
});

startWebSocketServer(server);

await connectDatabase();
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Erreur lors de l'upload" });
  }
  next();
});
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 HTTP Server : http://localhost:${PORT}`);
});