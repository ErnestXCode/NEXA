const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const School = require("../../models/School");

/* -------------------------------
   🔹 Bulk Onboarding
--------------------------------*/
const addFeesBulk = async (req, res) => {
  try {
    const { rows, academicYear } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ msg: "No records provided" });
    }
    if (!academicYear) {
      return res.status(400).json({ msg: "academicYear is required" });
    }

    const requester = req.user;
    const schoolId = requester.school;

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ msg: "School not found" });

    let created = 0;
    let skipped = [];

    for (const r of rows) {
      const { firstName, middleName, lastName, classLevel, term, balance } = r;

      if (!firstName || !lastName || !classLevel || !term || balance == null) {
        skipped.push({ ...r, reason: "Missing required fields" });
        continue;
      }

      const student = await Student.findOne({
        firstName: firstName.trim(),
        middleName: middleName?.trim(),
        lastName: lastName.trim(),
        classLevel,
        school: schoolId,
      });

      if (!student) {
        skipped.push({ ...r, reason: "Student not found" });
        continue;
      }

      const fee = new Fee({
        student: student._id,
        term,
        academicYear,
        classLevel,
        amount: balance,
        type: "adjustment",
        method: "system",
        note: "Bulk onboarding balance",
        school: schoolId,
        handledBy: requester.userId,
      });

      await fee.save();

      // After pushing to payments
      student.payments.push({
        academicYear,
        term,
        amount: balance,
        category: "adjustment",
        type: "system",
        note: "Bulk onboarding balance",
      });

      // 🔹 Update amtPaidTermX
      if (term === "Term 1") student.amtPaidTerm1 += balance;
      if (term === "Term 2") student.amtPaidTerm2 += balance;
      if (term === "Term 3") student.amtPaidTerm3 += balance;

      await student.save();

      created++;
    }

    return res.status(201).json({
      msg: "Bulk onboarding completed",
    });
  } catch (err) {
    console.error("addFeesBulk error:", err);
    res.status(500).json({ msg: "Server error", error: err.msg });
  }
};

/* -------------------------------
   🔹 Add Payment / Adjustment
--------------------------------*/
const addFee = async (req, res) => {
  try {
    const { studentId, term, academicYear, amount, type, method, note } =
      req.body;
    const handledBy = req.user.userId || req.user._id;

    if (!academicYear) {
      return res.status(400).json({ msg: "academicYear is required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Compute balances before transaction
    const balancesBefore = await student.computeBalances(academicYear);
    const balanceBefore = balancesBefore[term] ?? 0;

    // Apply transaction
    let balanceAfter =
      type === "payment" ? balanceBefore - amount : balanceBefore + amount;
    const carryOver = balanceAfter < 0;

    // Save Fee record
    const fee = await Fee.create({
      student: student._id,
      term,
      academicYear,
      classLevel: student.classLevel,
      amount,
      type,
      method,
      note,
      handledBy,
      school: student.school,
      carryOver,
    });

    // Push to student.payments
    // Push to student.payments
    student.payments.push({
      academicYear,
      term,
      amount,
      category: type,
      method,
      note,
    });

    // 🔹 Update amtPaidTermX
    if (term === "Term 1") student.amtPaidTerm1 += amount;
    if (term === "Term 2") student.amtPaidTerm2 += amount;
    if (term === "Term 3") student.amtPaidTerm3 += amount;

    await student.save();

    return res.status(201).json({
      msg: "Fee recorded successfully",
    });
  } catch (err) {
    console.error("addFee error:", err);
    res.status(500).json({ msg: "Server error", error: err.msg });
  }
};

/* -------------------------------
   🔹 Get Student Fee History
--------------------------------*/
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
      .json({ msg: "Error fetching student fees", error: err.msg });
  }
};

/* -------------------------------
   🔹 Outstanding Fees (per student)
--------------------------------*/
const getOutstandingFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    if (!academicYear) {
      return res.status(400).json({ msg: "academicYear query is required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    const balances = await student.computeBalances(academicYear);

    res.json({
      academicYear,
      balances,
    });
  } catch (err) {
    console.error("getOutstandingFees error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* -------------------------------
   🔹 Total Outstanding (all students)
--------------------------------*/
const getTotalOutstanding = async (req, res) => {
  try {
    const { term, classLevel, academicYear } = req.query;
    if (!term || !academicYear) {
      return res
        .status(400)
        .json({ msg: "term and academicYear are required" });
    }

    const filter = classLevel && classLevel !== "All" ? { classLevel } : {};
    const students = await Student.find(filter);

    let totalOutstanding = 0;

    for (const student of students) {
      const balances = await student.computeBalances(academicYear);
      const bal = balances[term] ?? 0;
      if (bal > 0) totalOutstanding += bal;
    }

    res.json({ academicYear, term, classLevel, totalOutstanding });
  } catch (err) {
    console.error("getTotalOutstanding error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getStudentOutstanding = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;
    if (!academicYear)
      return res.status(400).json({ msg: "academicYear required" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    const balances = await student.computeBalances(academicYear);

    res.json({ studentId, academicYear, balances }); // 🔹 balances per term
  } catch (err) {
    console.error("getStudentOutstanding error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* -------------------------------
   🔹 Edit Fee
--------------------------------*/
const editFee = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { amount, type, method, note } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ msg: "Fee not found" });

    const student = await Student.findById(fee.student);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Update student.payments
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
      if (method !== undefined) paymentEntry.method = method;
      if (note !== undefined) paymentEntry.note = note;
    }
    await student.save();

    // Update Fee record
    if (amount !== undefined) fee.amount = amount;
    if (type !== undefined) fee.type = type;
    if (method !== undefined) fee.method = method;
    if (note !== undefined) fee.note = note;

    await fee.save();

    res.status(200).json(fee);
  } catch (err) {
    console.error("editFee error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* -------------------------------
   🔹 Delete Fee
--------------------------------*/
const deleteFee = async (req, res) => {
  try {
    const { feeId } = req.params;

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ msg: "Fee not found" });

    const student = await Student.findById(fee.student);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    student.payments = student.payments.filter(
      (p) =>
        !(
          p.academicYear === fee.academicYear &&
          p.term === fee.term &&
          p.amount === fee.amount &&
          p.category === fee.type &&
          p.method === fee.method
        )
    );

    await student.save();
    await fee.deleteOne();

    res.status(200).json({ msg: "Fee deleted" });
  } catch (err) {
    console.error("deleteFee error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  addFee,
  getStudentFees,
  getOutstandingFees,
  addFeesBulk,
  getAllFees: async (req, res) => {
    try {
      const requester = req.user;
      const query =
        requester.role === "superadmin" ? {} : { school: requester.school };
      const fees = await Fee.find(query).sort({ createdAt: -1 });
      res.status(200).json(fees);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Error fetching fees", error: err.msg });
    }
  },
  editFee,
  deleteFee,
  getTotalOutstanding,
  getStudentOutstanding,
};
