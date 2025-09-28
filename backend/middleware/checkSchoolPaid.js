const School = require("../models/School");
const Billing = require("../models/Billing");

const checkSchoolPaid = async (req, res, next) => {
  try {
    const schoolId = req.user.school;
    if (!schoolId) return res.status(400).json({ message: "No school assigned" });

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    if (school.isPilotSchool) return next();

    const now = new Date();

    console.log(school)

    // Only check if last check was more than 24h ago
    if (!school.lastPesapalCheck || (now - school.lastPesapalCheck) > 24*60*60*1000) {

      // Get latest paid payment
      const latestPayment = await Billing.findOne({ 
        school: schoolId, 
        status: "paid" 
      }).sort({ createdAt: -1 });

      let paidPesapal = false;

      if (latestPayment) {
        const expiryDate = new Date(latestPayment.createdAt);
        expiryDate.setDate(expiryDate.getDate() + 90); // 1 term ~ 90 days
        paidPesapal = now <= expiryDate;
      }

      // Update school safely without touching populated arrays
      await School.findByIdAndUpdate(schoolId, {
        paidPesapal,
        lastPesapalCheck: now
      });
    }

    const updatedSchool = await School.findById(schoolId);
    if (!updatedSchool.paidPesapal) {
      return res.status(403).json({ message: "School has not paid or payment expired" });
    }

    next();
  } catch (err) {
    console.error("Pesapal expiry check error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = checkSchoolPaid;
