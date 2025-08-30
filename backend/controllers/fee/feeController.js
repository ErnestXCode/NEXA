const Activity = require("../../models/Activity");
const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const User = require("../../models/User");


// Add payment / adjust fee
const addFee = async (req, res) => {
    console.log('hit fees')
  try {
    const requester = req.user;
    const { studentId, amount, type = "payment", note } = req.body;

    const requesterDoc = await User.findOne({email: requester.email});
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    if (type === "payment") student.feeBalance -= amount;
    if (type === "adjustment") student.feeBalance += amount;

    await student.save();

    const feeRecord = new Fee({
      student: student._id,
      amount,
      type,
      note,
      handledBy: requesterDoc._id,
      school: requester.school,
    });

    await feeRecord.save();

    const newLog = new Activity({
          type: "fee",
          description: `Fee added for ${student.firstName} ${student.lastName} , KES ${amount}`,
          createdBy: requesterDoc._id,
          school: requester.school,
        });
    
        await newLog.save();

    res.status(200).json({ msg: "Fee updated", student, feeRecord });
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Error updating fee", error: err.message });
  }
};

// Get fee history for a student
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

module.exports = { addFee, getStudentFees };
