import { Server, Socket } from "socket.io";

const EVENTS = {
  connection: "connection",
};

function socket({ io }: { io: Server }) {
  console.log("Sockets enabled");

  io.on(EVENTS.connection, (socket: Socket) => {
    console.log(`A user connected ${socket.id}`);
  });
}

export default socket;
