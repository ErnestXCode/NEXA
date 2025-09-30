// routes/manualPayments.js
const express = require("express");
const { submitProof, verifyProof } = require("../controllers/pesapal/manualPaymentController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const ManualPayment = require("../models/ManualPayment");
    const payments = await ManualPayment.find()
      .populate("school", "name email phone") // ✅ show school info
      .sort({ submittedAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error("Fetch manual payments error:", err.message);
    res.status(500).json({ error: "Could not fetch payments" });
  }
});

module.exports = router;

router.post("/submit", verifyJWT, submitProof);
router.post("/verify", verifyJWT, verifyProof); // protect with admin role later

module.exports = router;
