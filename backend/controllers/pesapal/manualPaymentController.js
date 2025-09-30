// controllers/manualPaymentController.js
const ManualPayment = require("../../models/ManualPayment");
const School = require("../../models/School");

exports.submitProof = async (req, res) => {
  try {
    const { plan, amount, mpesaCode } = req.body;
    const schoolId = req.user.school;

    // prevent duplicates
    const exists = await ManualPayment.findOne({ mpesaCode });
    if (exists) {
      return res.status(400).json({ error: "This M-Pesa code has already been used." });
    }

    const payment = await ManualPayment.create({
      school: schoolId,
      plan,
      amount,
      mpesaCode,
    });

    await School.findByIdAndUpdate(schoolId, {
      $push: { payments: payment._id },
    });

    res.json({ msg: "Payment proof submitted. Awaiting verification.", payment });
  } catch (err) {
    console.error("Manual payment error:", err.message);
    res.status(500).json({ error: "Could not submit proof" });
  }
};

exports.verifyProof = async (req, res) => {
  try {
    const { id, status } = req.body; // status = "verified" or "rejected"
    const payment = await ManualPayment.findById(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    payment.status = status;
    if (status === "verified") payment.verifiedAt = new Date();
    await payment.save();

    if (status === "verified") {
      await School.findByIdAndUpdate(payment.school, {
        $set: { paidPesapal: true }, // ✅ reuse same flag
      });
    }

    res.json({ msg: `Payment ${status}`, payment });
  } catch (err) {
    console.error("Verify proof error:", err.message);
    res.status(500).json({ error: "Could not verify proof" });
  }
};
