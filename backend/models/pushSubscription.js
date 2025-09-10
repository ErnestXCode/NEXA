const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  subscription: { type: Object, required: true },
});

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
