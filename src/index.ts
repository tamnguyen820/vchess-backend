import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import router from "./router";
import { Server } from "socket.io";
import socket from "./socket";

dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    credentials: true,
  },
});

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  socket({ io });
});

mongoose.set("strictQuery", true);
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URL);
mongoose.connection.on("error", (err: Error) => console.log(err));

app.use("/", router());
