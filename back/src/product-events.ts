import type { Response } from "express";

const clients = new Set<Response>();

export function subscribeToProductEvents(response: Response) {
  clients.add(response);
  response.status(200).set({
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "X-Accel-Buffering": "no",
  });
  response.flushHeaders();
  response.write(": connected\n\n");

  const heartbeat = setInterval(() => {
    response.write(": keep-alive\n\n");
  }, 25_000);

  response.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(response);
  });
}

export function notifyProductsChanged() {
  for (const client of clients) {
    client.write(`data: ${JSON.stringify({ type: "products-changed" })}\n\n`);
  }
}
