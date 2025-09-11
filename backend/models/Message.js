const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    type: { type: String, enum: ["chat", "email"], default: "chat" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
