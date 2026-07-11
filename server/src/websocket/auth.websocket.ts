import { IncomingMessage } from "http";
import { verifyAccessToken } from "../utils/jwt.js";

const getTokenFromRequest = (
  req: IncomingMessage
): string | null => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`
  );

  return url.searchParams.get("token");
};

export const authenticateSocket = (
  req: IncomingMessage
): string => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = verifyAccessToken(token);

  return payload.userId;
};
