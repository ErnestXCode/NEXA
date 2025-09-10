// routes/push.js
const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const pushSubscription = require("../models/pushSubscription");


const router = express.Router();

// POST /api/push-subscribe
router.post("/subscribe",verifyJWT, async (req, res) => {
  try {
    const user = req.user; // make sure verifyJWT middleware is used
    const sub = req.body;
    await pushSubscription.findOneAndUpdate(
      { user: user.userId },
      { user: user.userId, school: user.school, subscription: sub },
      { upsert: true, new: true }
    );
    res.status(201).json({ msg: "Subscription saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to save subscription" });
  }
});


module.exports = router;
