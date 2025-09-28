const express = require("express");
const School = require("../models/School");
const { createPayment } = require("../controllers/pesapal/pesapalController");
const verifyJWT = require("../middleware/verifyJWT");

const { verifyTransaction } = require("../utils/verifyPesapalTransaction");
const Billing = require("../models/Billing");
const router = express.Router();

// ------------------
// IPN endpoint
// ------------------
// ------------------
// IPN endpoint
// ------------------
router.all("/ipn", async (req, res) => {
  console.log("hit ipn", req.method, req.body, req.query);

  const OrderTrackingId =
    req.body?.OrderTrackingId || req.query?.OrderTrackingId;

  if (!OrderTrackingId) {
    return res.status(400).send("Missing OrderTrackingId");
  }

  try {
    const tx = await verifyTransaction(OrderTrackingId);
    console.log("✅ Verified transaction:", tx);

    const { merchant_reference, status_code, amount } = tx;

    const billing = await Billing.findOne({ merchant_ref: merchant_reference });
    if (!billing) {
      console.warn(`⚠️ No billing found for reference ${merchant_reference}`);
      return res.sendStatus(404);
    }

    // Track school id
    const schoolId = billing.school;

    if (status_code === 1) {
      const now = new Date();

      billing.status = "paid";
      billing.paidAt = now; // <-- mark when paid
      await billing.save();

      await School.findByIdAndUpdate(
        schoolId,
        {
          $set: { paidPesapal: true },
          $addToSet: { payments: billing._id },
        },
        { new: true }
      );
    } else if (status_code === 2) {
      billing.status = "failed";
      await billing.save();
    } else {
      billing.status = "pending";
      await billing.save();
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Pesapal IPN error:", err.response?.data || err.message);
    res.status(500).send("ERROR");
  }
});

// ------------------
// Create payment link
// ------------------
router.post("/create-payment", verifyJWT, createPayment);

module.exports = router;
