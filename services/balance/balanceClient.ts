// balanceClient.ts

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(authToken: string) {
  if (socket) return socket;
  socket = io(process.env.NEXT_PUBLIC_API_URL!, {
    transports: ["websocket"],
    auth: { token: authToken },
  });
  return socket;
}

export function subscribeBalance(
  memberId: string,
  onUpdate: (bal: string) => void
) {
  if (!socket) return () => {};
  const room = `user:${memberId}`;
  const handler = (payload: { balance: string }) => onUpdate(payload.balance);
  socket.on("balance:update", handler);
  return () => socket?.off("balance:update", handler);
}
