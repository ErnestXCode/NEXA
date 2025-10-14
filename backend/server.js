const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const compression = require('compression');

const cors = require("cors");
const connectDB = require("./config/connectDB");
const http = require("http");
const { Server } = require("socket.io");

const helmet = require("helmet"); // secure headers
const mongoSanitize = require("express-mongo-sanitize"); // prevent Mongo injection
const xss = require("xss-clean"); // prevent XSS attacks
const rateLimit = require("express-rate-limit"); 

// 🔹 Add cron
const cron = require("node-cron");
const Student = require("./models/Student"); // adjust path if needed


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

    // Log all rooms
    const rooms = io.sockets.adapter.rooms;
    console.log("All rooms:", rooms);
    
    // Optional: list sockets in this room
    const clients = io.sockets.adapter.rooms.get(schoolId);
    console.log(`Sockets in room ${schoolId}:`, clients ? Array.from(clients) : []);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});


// Export io for use in controllers
app.set("io", io);

const whiteList = [process.env.VITE_URL, "https://cron-job.org", 'http://localhost:3000', 'http://localhost:4173'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin) || !origin) callback(null, true);
    else callback(new Error("Not Allowed By CORS"));
  },
  credentials: true,
};


// app.use(
//   helmet({
//     contentSecurityPolicy: false, // or customize it
//     crossOriginEmbedderPolicy: false, // only if needed
//   })
// );

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(compression());


// app.use((req, res, next) => {
//   if (!req.body && !req.query && !req.params) return next();
//   try {
//     xss()(req, res, next);
//   } catch (err) {
//     console.warn("XSS middleware skipped for non-HTTP request", err);
//     next();
//   }
// });

// app.use((req, res, next) => {
//   // Skip WebSocket connections or anything without req.body/query/params
//   if (!req.body && !req.query && !req.params) return next();

//   // Only apply if req.body/query/params are objects
//   try {
//     mongoSanitize()(req, res, next);
//   } catch (err) {
//     console.warn('Mongo sanitize skipped for non-HTTP request', err);
//     next();
//   }
// });


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
app.use("/api/reports", require("./routes/report"));
app.use("/api/push", require("./routes/push"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/pesapal", require("./routes/pesapal"));
app.use("/api/manual-payments", require("./routes/manualPayments"));
app.use("/api/credits", require("./routes/credits"));


app.get("/api/ping", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Nexa is alive",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Connect to MongoDB immediately (start waking up the cluster early)
const dbReady = connectDB().then(() => {
  console.log("MongoDB connected");
});


dbReady.then(() => {
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

      console.log(`Promoted ${promotedCount} students to next class for new year`);
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
