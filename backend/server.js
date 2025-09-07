const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/connectDB");

console.log('mongo-----------------------------',process.env.MONGO_URI)


const app = express();

const whiteList = [process.env.VITE_URL];

const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed By CORS"));
    }
  },
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

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
app.use("/api/settings", require("./routes/settings"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log("Listening on Port 5000");
});
