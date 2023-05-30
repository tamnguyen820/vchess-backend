import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid";

const EVENTS = {
  // Utils
  connection: "connection",
  disconnect: "disconnect",
  message: "message",

  // Match-making
  createRoom: "createRoom",
  joinRoom: "joinRoom",
  joinQueue: "joinQueue",

  // Game
  seeMove: "seeMove",
  gameDecision: "gameDecision",

  CLIENT: {
    joinedRoom: "joinedRoom",
    move: "move",
  },
};

const QUEUE_NAME = "QUEUE";

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

    socket.on(EVENTS.joinQueue, () => {
      socket.join(QUEUE_NAME);
      const clients = io.sockets.adapter.rooms.get(QUEUE_NAME);
      if (clients.size >= 2) {
        let playerCount = 0;
        const colors = ["w", "b"];
        const roomId = nanoid();
        // Connect 2 random clients
        for (const socketId of clients) {
          const clientSocket = io.sockets.sockets.get(socketId);
          clientSocket.leave(QUEUE_NAME);
          clientSocket.join(roomId);
          clientSocket.emit(EVENTS.CLIENT.joinedRoom, {
            roomId: roomId,
            color: colors[playerCount],
          });
          playerCount++;
          if (playerCount === 2) break;
        }
        console.log(`Started game ${roomId}`);
      }
    });

    socket.on(EVENTS.CLIENT.move, ({ move, roomId }) => {
      socket.broadcast.to(roomId).emit(EVENTS.seeMove, { move });
    });
  });
}

export default socket;
