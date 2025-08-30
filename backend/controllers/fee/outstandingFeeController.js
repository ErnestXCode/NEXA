const Fee = require("../../models/Fee");
const Student = require("../../models/Student");

const getOutstandingFees = async (req, res) => {
  try {
    const requester = req.user;
    const studentQuery = requester.role === "superadmin" ? {} : { school: requester.school };

    // Option 1: Sum all students' feeBalance
    const students = await Student.find(studentQuery);
    const totalOutstanding = students.reduce((sum, s) => sum + s.feeBalance, 0);

    // Option 2: (Alternative) Sum all fee amounts by type
    // const fees = await Fee.find(requester.role === "superadmin" ? {} : { school: requester.school });
    // const totalOutstanding = fees.reduce((sum, f) => {
    //   return f.type === "payment" ? sum - f.amount : sum + f.amount;
    // }, 0);

    res.status(200).json({ totalOutstanding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching outstanding fees", error: err.message });
  }
};

module.exports = getOutstandingFees;
