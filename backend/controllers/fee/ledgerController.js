const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const School = require("../../models/School");

// GET /fees/ledger/:studentId?term=&academicYear=
const getLedger = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academicYear } = req.query;

    if (!academicYear) return res.status(400).json({ message: "academicYear required" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const query = { student: studentId, academicYear };
    if (term) query.term = term;

    const fees = await Fee.find(query)
      .sort({ date: 1 })
      .populate("handledBy", "firstName lastName");

    // Compute running balance
    let balance = 0;
    const ledger = fees.map((f) => {
      balance += f.type === "payment" ? -f.amount : f.amount; // payment decreases balance
      return {
        date: f.date,
        type: f.type,
        method: f.method,
        amount: f.amount,
        note: f.note,
        balanceAfter: balance,
        handledBy: f.handledBy,
      };
    });

    res.json(ledger);
  } catch (err) {
    console.error("getLedger error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getLedger };
