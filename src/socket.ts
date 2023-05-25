import { Server, Socket } from "socket.io";

const EVENTS = {
  connection: "connection",
  disconnect: "disconnect",
};

function socket({ io }: { io: Server }) {
  console.log("Sockets enabled");

  io.on(EVENTS.connection, (socket: Socket) => {
    console.log(`A user connected: ${socket.id}`);
    socket.on(EVENTS.disconnect, () => {
      console.log(`A user disconnected: ${socket.id}`);
    });
  });
}

export default socket;
