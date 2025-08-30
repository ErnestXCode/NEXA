// models/Activity.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "student", "payment", "teacher"
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Activity", activitySchema);
