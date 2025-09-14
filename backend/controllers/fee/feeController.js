const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const School = require("../../models/School");

// --- Get all fees ---
const getAllFees = async (req, res) => {
  try {
    const requester = req.user;
    const query =
      requester.role === "superadmin" ? {} : { school: requester.school };

    const fees = await Fee.find(query).sort({ createdAt: -1 });
    res.status(200).json(fees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching fees", error: err.message });
  }
};

// --- Add payment / adjustment ---
// --- Add payment / adjustment ---
// POST /fees
const addFee = async (req, res) => {
  try {
    const { studentId, term, academicYear, amount, type, method, note } =
      req.body;

    if (!academicYear) {
      return res.status(400).json({ message: "academicYear is required" });
    }

    const student = await Student.findById(studentId).populate("school");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const school = student.school;
    const termOrder = ["Term 1", "Term 2", "Term 3"];
    let remainingAmount = amount;
    let termIndex = termOrder.indexOf(term);

    while (remainingAmount > 0 && termIndex < termOrder.length) {
      const currentTerm = termOrder[termIndex];

      // Calculate expected fee for this term
      let expected = 0;
      const classDef = school.classLevels.find(
        (c) => c.name === student.classLevel
      );
      if (classDef?.feeExpectations?.length) {
        expected =
          classDef.feeExpectations.find((f) => f.term === currentTerm)
            ?.amount || 0;
      }
      if (!expected) {
        expected =
          school.feeExpectations.find((f) => f.term === currentTerm)?.amount ||
          0;
      }

      // Total already paid for this term
      const paid = student.payments
        .filter(
          (p) =>
            p.term === currentTerm &&
            p.academicYear === academicYear &&
            p.category === "payment"
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const adjustments = student.payments
        .filter(
          (p) =>
            p.term === currentTerm &&
            p.academicYear === academicYear &&
            p.category === "adjustment"
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const balance = expected - paid + adjustments;

      const applyAmount = Math.min(remainingAmount, balance > 0 ? balance : 0);
      const overpay = remainingAmount - applyAmount;

      // Record fee for this term
      const fee = new Fee({
        student: studentId,
        term: currentTerm,
        academicYear,
        classLevel: student.classLevel,
        amount: applyAmount,
        type,
        method,
        note,
        school: student.school,
        handledBy: req.user.userId,
        balanceAfter: balance - applyAmount,
        carryOver: overpay > 0,
      });

      await fee.save();

      student.payments.push({
        academicYear,
        term: currentTerm,
        amount: applyAmount,
        category: type,
        type: method,
        note,
      });

      remainingAmount = overpay;
      termIndex++; // move to next term if there is rollover
    }

    await student.save();

    res
      .status(201)
      .json({
        message: "Payment recorded",
        amountApplied: amount - remainingAmount,
      });
  } catch (err) {
    console.error("addFee error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Get student fee history ---
const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const requester = req.user;
    const query = { student: studentId };
    if (requester.role !== "superadmin") query.school = requester.school;

    const records = await Fee.find(query).sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Error fetching student fees", error: err.message });
  }
};

// --- Helper: check if className is within fromClass..toClass range based on the school's classLevels order ---
const isClassInRange = (className, fromClass, toClass, allClasses = []) => {
  const idx = allClasses.findIndex((c) => c.name === className);
  const fromIdx = allClasses.findIndex((c) => c.name === fromClass);
  const toIdx = allClasses.findIndex((c) => c.name === toClass);
  if (idx === -1 || fromIdx === -1 || toIdx === -1) return false;
  const min = Math.min(fromIdx, toIdx);
  const max = Math.max(fromIdx, toIdx);
  return idx >= min && idx <= max;
};

// --- Get total outstanding fees dynamically ---
// NOTE: this function now respects:
// 1) school.feeRules (ranges) -> if matched for student's class, use rule(s)
// 2) class-level feeExpectations (if defined)
// 3) fallback to school.feeExpectations
// GET /fees/outstanding/:studentId?academicYear=2025/2026
const getOutstandingFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    if (!academicYear) {
      return res
        .status(400)
        .json({ message: "academicYear query is required" });
    }

    const student = await Student.findById(studentId).populate("school");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const school = await School.findById(student.school);

    // 1️⃣ expected amount for this class & year
    const classExpectations =
      school.classLevels.find((cl) => cl.name === student.classLevel)
        ?.feeExpectations || [];

    const expected = classExpectations
      .filter((e) => e.academicYear === academicYear)
      .reduce((acc, e) => acc + e.amount, 0);

    // 2️⃣ payments so far in this year
    const paid = student.payments
      .filter((p) => p.academicYear === academicYear)
      .reduce((acc, p) => acc + p.amount, 0);

    res.json({
      academicYear,
      expected,
      paid,
      balance: expected - paid,
    });
  } catch (err) {
    console.error("getOutstandingFees error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTotalOutstanding = async (req, res) => {
  try {
    const { term, classLevel } = req.query;
    if (!term) {
      return res.status(400).json({ message: "term query is required" });
    }

    // Fetch all students, optionally filter by class
    const students = await Student.find(
      classLevel && classLevel !== "All" ? { classLevel } : {}
    ).populate("school");

    let totalOutstanding = 0;

    for (const student of students) {
      const school = student.school;

      // find expected amount (same logic you used in frontend)
      let expectations = [];

      const idx = school.classLevels.findIndex(
        (c) => c.name === student.classLevel
      );

      const matchedRules = school.feeRules?.filter((rule) => {
        const fromIdx = school.classLevels.findIndex(
          (c) => c.name === rule.fromClass
        );
        const toIdx = school.classLevels.findIndex(
          (c) => c.name === rule.toClass
        );
        if (idx === -1 || fromIdx === -1 || toIdx === -1) return false;
        const min = Math.min(fromIdx, toIdx);
        const max = Math.max(fromIdx, toIdx);
        return idx >= min && idx <= max && rule.term === term;
      });

      if (matchedRules?.length) expectations = matchedRules;

      if (!expectations.length) {
        const classDef = (school.classLevels || []).find(
          (c) => c.name === student.classLevel
        );
        if (classDef?.feeExpectations?.length) {
          expectations = classDef.feeExpectations.filter(
            (f) => f.term === term
          );
        }
      }

      if (!expectations.length) {
        expectations = (school.feeExpectations || []).filter(
          (f) => f.term === term
        );
      }

      const expected = expectations[0]?.amount || 0;

      const payments = student.payments
        .filter((p) => p.term === term && p.category === "payment")
        .reduce((sum, p) => sum + p.amount, 0);

      const adjustments = student.payments
        .filter((p) => p.term === term && p.category === "adjustment")
        .reduce((sum, p) => sum + p.amount, 0);

      const balance = expected - payments + adjustments;
      if (balance > 0) totalOutstanding += balance; // only debts
    }

    res.json({ term, classLevel, totalOutstanding });
  } catch (err) {
    console.error("getTotalOutstanding error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const editFee = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { amount, type, method, note } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    const student = await Student.findById(fee.student);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // --- Update student.payments ---
    const paymentEntry = student.payments.find(
      (p) =>
        p.academicYear === fee.academicYear &&
        p.term === fee.term &&
        p.amount === fee.amount &&
        p.category === fee.type
    );
    if (paymentEntry) {
      if (amount !== undefined) paymentEntry.amount = amount;
      if (type !== undefined) paymentEntry.category = type;
      if (method !== undefined) paymentEntry.type = method;
      if (note !== undefined) paymentEntry.note = note;
    }

    await student.save();

    // --- Update Fee record ---
    if (amount !== undefined) fee.amount = amount;
    if (type !== undefined) fee.type = type;
    if (method !== undefined) fee.method = method;
    if (note !== undefined) fee.note = note;
    

    await fee.save();

    res.status(200).json(fee);
  } catch (err) {
    console.error("editFee error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Delete a fee/payment ---
const deleteFee = async (req, res) => {
  try {
    const { feeId } = req.params;

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    const student = await Student.findById(fee.student);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Remove from student.payments
    student.payments = student.payments.filter(
      (p) =>
        !(
          p.academicYear === fee.academicYear &&
          p.term === fee.term &&
          p.amount === fee.amount &&
          p.category === fee.type
        )
    );

    await student.save();
    await fee.deleteOne();

    res.status(200).json({ message: "Fee deleted" });
  } catch (err) {
    console.error("deleteFee error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addFee,
  getStudentFees,
  getOutstandingFees,
  getAllFees,
  editFee, 
  deleteFee,
  getTotalOutstanding,
};
