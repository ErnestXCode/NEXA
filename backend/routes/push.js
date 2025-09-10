// routes/push.js
const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const PushSubscription = require("../models/pushSubscription");

const router = express.Router();

router.post("/subscribe", verifyJWT, async (req, res) => {
  const { subscription } = req.body;
  const user = req.user;

  if (!subscription) return res.status(400).json({ msg: "No subscription" });

  await PushSubscription.findOneAndUpdate(
    { user: user.userId },
    {school: user.school},
    { subscription },
    { upsert: true }
  );

  res.status(201).json({ msg: "Subscribed successfully" });
});

module.exports = router;
