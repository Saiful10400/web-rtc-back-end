"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://192.168.1.20:5173",
        ],
        methods: ["GET", "POST"],
    },
});
let users = [];
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("join_user", (data) => {
        if (!users.find((item) => item.id === socket.id)) {
            users.push(Object.assign(Object.assign({}, data), { id: socket.id }));
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
    socket.on("offer", (e) => {
        const receiver = users.find((item) => item.email === e.to);
        if (receiver) {
            io.to(receiver.id).emit("offer-sv", e);
        }
    });
    socket.on("ans", (e) => {
        const sender = users.find((item) => item.email === e.from);
        if (sender) {
            io.to(sender.id).emit("ans-sv", e);
        }
    });
    socket.on("icecandidate", (candidate) => {
        console.log("ICE Candidate received:", candidate);
        socket.broadcast.emit("icecandidate", candidate);
    });
});
app.get("/", (req, res) => {
    res.send([
        { id: 1, name: "John Doe", age: 30, email: "john.doe@example.com" },
        { id: 2, name: "Jane Smith", age: 25, email: "jane.smith@example.com" },
        { id: 3, name: "Sam Green", age: 35, email: "sam.green@example.com" },
    ]);
});
httpServer.listen(5000, () => {
    console.log(`Server is running at http://localhost:5000`);
});
