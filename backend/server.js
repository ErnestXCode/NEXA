const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const http = require("http");
const { Server } = require("socket.io");

console.log('mongo-----------------------------', process.env.MONGO_URI);

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.VITE_URL || "*", credentials: true },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinSchool", (schoolId) => {
    socket.join(schoolId);
    console.log(`Socket ${socket.id} joined school ${schoolId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Export io for use in controllers
app.set("io", io);

const whiteList = [process.env.VITE_URL];
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin) || !origin) callback(null, true);
    else callback(new Error("Not Allowed By CORS"));
  },
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Routes
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/exams", require("./routes/exam"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/fees", require("./routes/fees"));
app.use("/api/personel", require("./routes/personel"));
app.use("/api/schools", require("./routes/schools"));
app.use("/api/students", require("./routes/students"));
app.use("/api/communication", require("./routes/communication"));
app.use("/api/activity", require("./routes/activity"));
app.use("/api/term", require("./routes/term"));
app.use("/api/reports", require("./routes/report"));
app.use("/api/push", require("./routes/push"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  connectDB();
  console.log("Listening on Port", PORT);
});

module.exports = { app, server, io };
