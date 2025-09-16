const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const http = require("http");
const { Server } = require("socket.io");

// 🔹 Add cron
const cron = require("node-cron");
const Student = require("./models/Student"); // adjust path if needed

console.log("mongo-----------------------------", process.env.MONGO_URI);

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

const whiteList = [process.env.VITE_URL, "https://cron-job.org"];
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
app.use("/api/reviews", require("./routes/review"));

app.get("/api/ping", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Nexa is alive",
    timestamp: new Date().toISOString(),
  });
});

// 🔹 Connect to MongoDB first
connectDB().then(() => {
  console.log("MongoDB connected");
  // Add near the top, after `const Student = require(...)`

  // CBC class promotion map
  const classPromotionMap = {
    PP1: "PP2",
    PP2: "Grade 1",
    "Grade 1": "Grade 2",
    "Grade 2": "Grade 3",
    "Grade 3": "Grade 4",
    "Grade 4": "Grade 5",
    "Grade 5": "Grade 6",
    "Grade 6": "Grade 7",
    "Grade 7": "Grade 8", // final grade
  };

  // Cron job: runs Jan 1st, 00:00   test it out with smaller time frame later
  cron.schedule("0 0 1 1 *", async () => {
    try {
      console.log("Running yearly student promotion...");

      const students = await Student.find({});
      let promotedCount = 0;

      for (let s of students) {
        const nextClass = classPromotionMap[s.classLevel];
        if (nextClass) {
          s.classLevel = nextClass;
          await s.save();
          promotedCount++;
        }
      }

      console.log(
        `Promoted ${promotedCount} students to next class for new year`
      );
    } catch (err) {
      console.error("Error promoting students:", err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Listening on Port", PORT);
});

module.exports = { app, server, io };
