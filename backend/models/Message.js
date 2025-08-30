const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  body: { type: String, required: true },
  sender: { type: String , required: true},
  school: { type: String }, // optional school scoping
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
