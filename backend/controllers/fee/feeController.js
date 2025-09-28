const FeeTransaction = require("../../models/FeeTransaction");
const Student = require("../../models/Student");
const School = require("../../models/School");

/* -------------------------------
   💰 Record a Payment / Adjustment
--------------------------------*/
exports.recordTransaction = async (req, res) => {
  try {
    const { studentId, academicYear, term, amount, type, method, note } =
      req.body;
    const userId = req.user.userId; // from auth middleware

    const student = await Student.findById(studentId).populate("school");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const txn = await FeeTransaction.create({
      student: studentId,
      school: student.school._id,
      academicYear,
      term,
      amount,
      type,
      method,
      note,
      handledBy: userId,
    });

    res.status(201).json({ message: "Transaction recorded", txn });
  } catch (err) {
    console.error("recordTransaction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   📊 Get Balance for a Student
--------------------------------*/
exports.getStudentBalance = async (req, res) => {
  try {
    const schoolId = req.user.school;

    const { academicYear } = req.query;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const balances = await student.computeBalances(academicYear);

    res.json({ studentId, academicYear, balances });
  } catch (err) {
    console.error("getStudentBalance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   🏫 Set Fee Rules for a School
--------------------------------*/
exports.setFeeRules = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { feeRules } = req.body;

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    school.feeRules = feeRules;
    await school.save();

    res.json({ message: "Fee rules updated", feeRules: school.feeRules });
  } catch (err) {
    console.error("setFeeRules error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   🔍 Get Transactions for Student
--------------------------------*/
exports.getStudentTransactions = async (req, res) => {
  try {
    const schoolId = req.user.school;

    const txns = await FeeTransaction.find({ student: studentId })
      .populate("handledBy", "name")
      .sort({ createdAt: -1 });

    res.json(txns);
  } catch (err) {
    console.error("getStudentTransactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   🏫 Whole-School Summary
--------------------------------*/
exports.getSchoolSummary = async (req, res) => {
  try {
    const schoolId = req.user.school;

    const { academicYear } = req.query;

    const students = await Student.find({ school: schoolId });

    let totalExpected = 0;
    let totalPaid = 0;

    for (const student of students) {
      const expected =
        (await student.getExpectedFee(academicYear, "Term 1")) +
        (await student.getExpectedFee(academicYear, "Term 2")) +
        (await student.getExpectedFee(academicYear, "Term 3"));

      const balances = await student.computeBalances(academicYear);

      const paid =
        expected -
        Object.values(balances).reduce((a, b) => a + (b.amount || b), 0);

      totalExpected += expected;
      totalPaid += paid;
    }

    res.json({
      schoolId,
      academicYear,
      expected: totalExpected,
      paid: totalPaid,
      outstanding: totalExpected - totalPaid,
    });
  } catch (err) {
    console.error("getSchoolSummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   📚 Class-Level Breakdown
--------------------------------*/
exports.getClassSummary = async (req, res) => {
  try {
    const schoolId = req.user.school;

    const { academicYear } = req.query;

    const students = await Student.find({ school: schoolId });

    const summary = {};

    for (const student of students) {
      const classLevel = student.classLevel;
      if (!summary[classLevel]) {
        summary[classLevel] = { expected: 0, paid: 0, outstanding: 0 };
      }

      const expected =
        (await student.getExpectedFee(academicYear, "Term 1")) +
        (await student.getExpectedFee(academicYear, "Term 2")) +
        (await student.getExpectedFee(academicYear, "Term 3"));

      const balances = await student.computeBalances(academicYear);

      const paid =
        expected -
        Object.values(balances).reduce((a, b) => a + (b.amount || b), 0);

      summary[classLevel].expected += expected;
      summary[classLevel].paid += paid;
      summary[classLevel].outstanding += expected - paid;
    }

    res.json(summary);
  } catch (err) {
    console.error("getClassSummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   🚨 Debtors List (Sorted)
--------------------------------*/
exports.getDebtors = async (req, res) => {
  try {
    const schoolId = req.user.school;

    const { academicYear } = req.query;

    const students = await Student.find({ school: schoolId });

    const debtors = [];

    for (const student of students) {
      const balances = await student.computeBalances(academicYear);

      const totalOutstanding = Object.values(balances).reduce(
        (a, b) => a + (b.amount || b),
        0
      );

      if (totalOutstanding > 0) {
        debtors.push({
          studentId: student._id,
          name: `${student.firstName} ${student.lastName}`,
          classLevel: student.classLevel,
          outstanding: totalOutstanding,
        });
      }
    }

    debtors.sort((a, b) => b.outstanding - a.outstanding); // highest first

    res.json(debtors);
  } catch (err) {
    console.error("getDebtors error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
