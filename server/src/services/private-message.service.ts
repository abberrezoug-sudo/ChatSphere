import { getSocketByUsername } from "./user.service.js";
import { sendJson } from "../utils/sendJson.js";

export const sendPrivateMessage = (
  to: string,
  payload: unknown
): boolean => {
  const receiver = getSocketByUsername(to);

  if (!receiver) {
    console.log(`${to} is offline`);
    return false;
  }

  sendJson(receiver, payload);

  console.log(`Private message sent to ${to}`);
  return true;
};
