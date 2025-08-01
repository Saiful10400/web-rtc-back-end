"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// socket io.
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
        ],
        methods: ["GET", "POST"],
    },
});
let user = [];
io.on("connection", (socket) => {
    socket.on("join_user", (data) => {
        if (!user.find((item) => item.id === socket.id)) {
            user.push(Object.assign(Object.assign({}, data), { id: socket.id }));
            io.to(socket.id).emit("success_join", { success: true, email: data.email });
        }
    });
    socket.on("disconnect", () => {
        var _a;
        const id = (_a = user.find((item) => item.id === socket.id)) === null || _a === void 0 ? void 0 : _a.id;
        user = user.filter((item) => item.id !== socket.id);
    });
    socket.on("get_active_user", () => {
        io.emit("active_user_list", user);
    });
    socket.on("Incoming_call_send", (data) => {
        const receiver = user.find(item => item.email === data.receiver);
        const sender = user.find(item => item.email === data.sender);
        if (receiver) {
            io.to(receiver.id).emit("Incoming_call_receive", { offer: data.offer, receiver, sender });
        }
    });
    //#negotiation.
    socket.on("Incoming_call_send_negotiation", (data) => {
        const receiver = user.find(item => item.email === data.receiver);
        const sender = user.find(item => item.email === data.sender);
        if (receiver) {
            io.to(receiver.id).emit("Incoming_call_receive_negotiation", { offer: data.offer, receiver, sender });
        }
    });
    socket.on("call_accepted", (data) => {
        const sender = user.find(item => item.email === data.sender);
        if (sender) {
            io.to(sender.id).emit("Receiver_call_received", { answer: data.answer, receiver: data.receiver, sender });
        }
    });
    //# negotiation
    socket.on("call_accepted_negotiation", (data) => {
        const sender = user.find(item => item.email === data.sender);
        if (sender) {
            io.to(sender.id).emit("Receiver_call_received_negotiation", { answer: data.answer, receiver: data.receiver, sender });
        }
    });
    // handle negotiation.
});
app.get("/", (req, res) => {
    res.send([
        {
            id: 1,
            name: "John Doe",
            age: 30,
            email: "john.doe@example.com"
        },
        {
            id: 2,
            name: "Jane Smith",
            age: 25,
            email: "jane.smith@example.com"
        },
        {
            id: 3,
            name: "Sam Green",
            age: 35,
            email: "sam.green@example.com"
        }
    ]);
});
httpServer.listen(5000, () => {
    console.log(`this server is runnning at http://localhost:5000`);
});
