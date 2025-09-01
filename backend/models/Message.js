const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
  type: { type: String, enum: ["school", "class", "student", "role"], required: true },
  value: { type: String, required: true }, // classId, studentId, role, or 'all'
});

const messageSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  body: { type: String, required: true },
  sender: { type: String, required: true },
  school: { type: String },
  recipients: [recipientSchema],
  type: { type: String, enum: ["sms", "email", "whatsapp"], default: "sms" },
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
