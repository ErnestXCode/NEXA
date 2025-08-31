const Activity = require("../../models/Activity");
const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const User = require("../../models/User");



// Add payment / adjustment
const addFee = async (req, res) => {
  try {
    const requester = req.user;
    const { studentId, amount, term, type = "payment", note, generateReceipt = false } = req.body;

    const requesterDoc = await User.findOne({email: requester.email})

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    if (type === "payment") student.feeBalance -= amount;
    if (type === "adjustment") student.feeBalance += amount;

    await student.save();

    const feeRecord = new Fee({
      student: student._id,
      term,
      classLevel: student.classLevel,
      amount,
      type,
      note,
      handledBy: requesterDoc._id,
      school: requester.school,
      receiptGenerated: generateReceipt,
    });

    await feeRecord.save();

    res.status(200).json({ msg: "Fee updated", student, feeRecord });
  } catch (err) {
    res.status(500).json({ msg: "Error updating fee", error: err.message });
  }
};

// Get fee history for student
const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const requester = req.user;
    const query = { student: studentId };
    if (requester.role !== "superadmin") query.school = requester.school;

    const records = await Fee.find(query);
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching fee history", error: err.message });
  }
};

// Get total outstanding fees (optionally filtered by term or class)

module.exports = { addFee, getStudentFees };
