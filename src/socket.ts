import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid";

const EVENTS = {
  // Utils
  connection: "connection",
  disconnect: "disconnect",
  message: "message",

  // Room
  createRoom: "createRoom",
  joinRoom: "joinRoom",

  // Game
  move: "move",
  gameDecision: "gameDecision",
};

function socket({ io }: { io: Server }) {
  console.log("Sockets enabled");

  io.on(EVENTS.connection, (socket: Socket) => {
    console.log(`A user connected, socket ${socket.id}`);

    socket.on(EVENTS.disconnect, () => {
      console.log(`A user disconnected, socket ${socket.id}`);
    });

    socket.on(EVENTS.createRoom, () => {
      const roomId = nanoid();
      socket.emit(EVENTS.message, `Created room ${roomId}`);
      socket.join(roomId);
      socket.emit(EVENTS.message, `Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on(EVENTS.joinRoom, (roomId: string) => {
      if (roomId) {
        socket.join(roomId);
        socket.broadcast.emit(
          EVENTS.message,
          `Socket ${socket.id} joined room ${roomId}`
        );
      }
    });

    socket.on(EVENTS.move, (move: string) => {
      socket.broadcast.emit(EVENTS.move, move);
    });
  });
}

export default socket;
