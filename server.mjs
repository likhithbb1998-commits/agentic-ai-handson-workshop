import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);
const app = next({ dev });
const handler = app.getRequestHandler();

await app.prepare();
const server = createServer((request, response) => handler(request, response));
const io = new Server(server, { cors: { origin: false }, transports: ["websocket", "polling"] });
globalThis.workshopIO = io;
io.on("connection", (socket) => socket.emit("CONNECTED", { at: new Date().toISOString() }));
server.listen(port, () => console.log(`LiuantX workshop ready at http://localhost:${port}`));
