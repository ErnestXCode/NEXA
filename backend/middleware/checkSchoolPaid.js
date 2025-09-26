const School = require("../models/School");

const checkSchoolPaid = async (req, res, next) => {
  const school = await School.findById(req.user.school);

  if (!school.paidPesapal) {
    return res.status(403).json({ message: "School has not paid yet" });
  }

  next();
};

module.exports = checkSchoolPaid;
