const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const User = require("../../models/User");

const getAllFees = async (req, res) => {
  try {
    const requester = req.user;

    const query = {};
    if (requester.role !== "superadmin") {
      query.school = requester.school;
    }

    const fees = await Fee.find(query)
    .sort({ createdAt: -1 });

    res.status(200).json(fees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching fees", error: err.message });
  }
};

// Add payment / adjustment
const addFee = async (req, res) => {
  try {
    const {
      studentId,
      amount,
      term,
      type = "payment",
      method = "cash", // new field for payment method
      note,
      generateReceipt = false,
    } = req.body;

    const requester = req.user;
    const requesterDoc = await User.findOne({ email: requester.email });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Check if term exists in student's feeExpectations
    const termIndex = student.feeExpectations.findIndex((f) => f.term === term);
    if (termIndex === -1)
      return res
        .status(400)
        .json({ msg: `Term ${term} not set up for student` });

    // Initialize termBalances if not present
    if (!student.termBalances) student.termBalances = {};
    if (student.termBalances[term] === undefined)
      student.termBalances[term] = student.feeExpectations[termIndex].amount;

    // Update term balance
    if (type === "payment") {
      student.termBalances[term] -= amount;
      if (student.termBalances[term] < 0) student.termBalances[term] = 0;
    } else if (type === "adjustment") {
      student.termBalances[term] += amount;
    }

    await student.save();

    // Save Fee record
    const feeRecord = new Fee({
      student: student._id,
      term,
      classLevel: student.classLevel,
      amount,
      type, // "payment" or "adjustment"
      method, // "cash", "mpesa", "card"
      note,
      handledBy: requesterDoc._id,
      school: requester.school,
      receiptGenerated: generateReceipt,
    });

    await feeRecord.save();

    res
      .status(200)
      .json({ msg: "Fee updated successfully", student, feeRecord });
  } catch (err) {
    console.error(err);
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

    const records = await Fee.find(query).sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching fee history", error: err.message });
  }
};

// Get total outstanding fees (optionally filtered by term or class)
const getOutstandingFees = async (req, res) => {
  try {
    const { term, classLevel } = req.query;
    const schoolQuery =
      req.user.role === "superadmin" ? {} : { school: req.user.school };

    let studentQuery = { ...schoolQuery };
    if (classLevel) studentQuery.classLevel = classLevel;

    const students = await Student.find(studentQuery);

    let totalOutstanding = 0;
    students.forEach((s) => {
      if (term) {
        const termExp = s.feeExpectations.find((f) => f.term === term);
        const termBalance =
          (s.termBalances && s.termBalances[term]) || termExp?.amount || 0;
        totalOutstanding += termBalance;
      } else {
        // sum across all terms
        const studentTotal = s.feeExpectations.reduce((sum, f) => {
          const bal = (s.termBalances && s.termBalances[f.term]) || f.amount;
          return sum + bal;
        }, 0);
        totalOutstanding += studentTotal;
      }
    });

    res.status(200).json({ totalOutstanding });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching outstanding fees", error: err.message });
  }
};

module.exports = { addFee, getStudentFees, getOutstandingFees, getAllFees };
