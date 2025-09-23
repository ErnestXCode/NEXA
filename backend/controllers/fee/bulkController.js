const Fee = require("../../models/Fee");
const Student = require("../../models/Student");

// POST /fees/bulk
const addFeesBulk = async (req, res) => {
  try {
    const { fees } = req.body; // array of { studentId, amount, type, term, academicYear, method, note }
    if (!Array.isArray(fees) || !fees.length)
      return res.status(400).json({ message: "No fees provided" });

    const createdFees = [];

    for (const f of fees) {
      const student = await Student.findOne({
        firstName: f.firstName,
        middleName: f.middleName,
        lastName: f.lastName,
        classLevel: f.classLevel,
      });
      if (!student) continue;

      const fee = new Fee({
        student: student._id,
        amount: f.amount,
        type: f.type || "payment",
        method: f.method || "cash",
        term: f.term,
        academicYear: f.academicYear,
        note: f.note || "",
        classLevel: student.classLevel,
        school: student.school,
        handledBy: req.user.userId,
      });

      await fee.save();
      createdFees.push(fee);
    }

    res
      .status(201)
      .json({ message: "Bulk fees added" });
  } catch (err) {
    console.error("addFeesBulk error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addFeesBulk };
