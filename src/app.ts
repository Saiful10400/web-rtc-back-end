import express, { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://videocall10400.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

type TUser = {
  name: string;
  email: string;
  id: string;
};

let users: TUser[] = [];

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_user", (data: Omit<TUser, "id">) => {
    if (!users.find((item) => item.id === socket.id)) {
      users.push({ ...data, id: socket.id });
      io.to(socket.id).emit("success_join", { success: true, email: data.email });
    }
  });

  socket.on("disconnect", () => {
    users = users.filter((item) => item.id !== socket.id);
    console.log("User disconnected:", socket.id);
  });

  socket.on("get_active_user", () => {
    io.emit("active_user_list", users);
  });

  socket.on("offer", (e: { from: string; to: string; offer: any }) => {
    const receiver = users.find((item) => item.email === e.to);
    if (receiver) {
      io.to(receiver.id).emit("offer-sv", e);
    }
  });

  socket.on("ans", (e: { from: string; to: string; answer: any }) => {
    const sender = users.find((item) => item.email === e.from);
    if (sender) {
      io.to(sender.id).emit("ans-sv", e);
    }
  });

  socket.on("icecandidate", (candidate: RTCIceCandidateInit) => {
    console.log("ICE Candidate received:", candidate);
    socket.broadcast.emit("icecandidate", candidate);
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send([
    { id: 1, name: "John Doe", age: 30, email: "john.doe@example.com" },
    { id: 2, name: "Jane Smith", age: 25, email: "jane.smith@example.com" },
    { id: 3, name: "Sam Green", age: 35, email: "sam.green@example.com" },
  ]);
});

httpServer.listen(5000, () => {
  console.log(`Server is running at http://localhost:5000`);
});
