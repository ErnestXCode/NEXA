const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  classLevel: { type: String, required: true },
  stream: { type: String },
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent"], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
