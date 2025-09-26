const express = require("express");
const School = require("../models/School");
const { createPayment } = require("../controllers/pesapal/pesapalController");
const verifyJWT = require("../middleware/verifyJWT");

const { verifyTransaction } = require("../utils/verifyPesapalTransaction");
const router = express.Router();

// ------------------
// IPN endpoint
// ------------------


router.post("/ipn", async (req, res) => {
  console.log("hit ipn", req.body);

  try {
    // Pesapal sends you an orderTrackingId
    const { OrderTrackingId } = req.body;

    if (!OrderTrackingId) {
      console.warn("⚠️ No OrderTrackingId in IPN body");
      return res.status(400).send("Missing OrderTrackingId");
    }

    // 🔍 Verify with Pesapal
    const tx = await verifyTransaction(OrderTrackingId);
    console.log("✅ Verified transaction:", tx);

    const { merchant_reference, payment_status, amount } = tx;

    if (payment_status === "COMPLETED") {
      const school = await School.findByIdAndUpdate(
        merchant_reference,
        { paidPesapal: true },
        { new: true }
      );
      if (school) {
        console.log(`✅ School ${school.name} has paid ${amount}`);
      } else {
        console.warn(`⚠️ No school found for reference ${merchant_reference}`);
      }
    }

    res.status(200).send("OK");
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
