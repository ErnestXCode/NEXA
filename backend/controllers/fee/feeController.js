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
    const { studentId, term, academicYear, amount, type, method, note } = req.body;

    if (!academicYear) {
      return res.status(400).json({ message: "academicYear is required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const fee = new Fee({
      student: studentId,
      term,
      academicYear, // ✅ always stored
      classLevel: student.classLevel,
      amount,
      type,
      method,
      note,
      school: student.school,
      handledBy: req.user.userId,
    });

    await fee.save();

    // also push into student.payments for quick lookups
    student.payments.push({
      academicYear,
      term,
      amount,
      category: type,
      type: method,
      note,
    });

    await student.save();

    res.status(201).json(fee);
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
      return res.status(400).json({ message: "academicYear query is required" });
    }

    const student = await Student.findById(studentId).populate("school");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const school = await School.findById(student.school);

    // 1️⃣ expected amount for this class & year
    const classExpectations = school.classLevels
      .find((cl) => cl.name === student.classLevel)?.feeExpectations || [];

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


const bulkUploadFees = async (req, res) => {
  try {
    const feeData = req.body; // array of fee objects

    if (!Array.isArray(feeData) || !feeData.length) {
      return res.status(400).json({ message: "No fee records provided" });
    }

    const results = [];

    for (const f of feeData) {
      const {
        studentId,
        term,
        academicYear,
        amount,
        type = "payment",
        method = "cash",
        note,
      } = f;

      const student = await Student.findById(studentId);
      if (!student) continue;

      const fee = new Fee({
        student: studentId,
        term,
        academicYear,
        classLevel: student.classLevel,
        amount,
        type,
        method,
        note,
        school: student.school,
        handledBy: req.user.userId,
      });
      await fee.save();

      // push into student payments
      student.payments.push({
        academicYear,
        term,
        amount,
        category: type,
        type: method,
        note,
      });
      await student.save();

      results.push({ studentId, success: true });
    }

    res.status(200).json({ message: "Bulk upload completed", results });
  } catch (err) {
    console.error("bulkUploadFees error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const bulkUploadStudentsWithFees = async (req, res) => {
  try {
    const studentsData = req.body; // array of student + fee data
    const results = [];

    for (const s of studentsData) {
      const {
        firstName,
        lastName,
        middleName,
        gender,
        dateOfBirth,
        classLevel,
        stream,
        academicYear,
        term,
        amount,
        method = "cash",
        note,
      } = s;

      // Create student
      const student = new Student({
        firstName,
        lastName,
        middleName,
        gender,
        dateOfBirth,
        classLevel,
        stream,
        school: req.user.school,
      });
      await student.save();

      // Create initial fee
      const fee = new Fee({
        student: student._id,
        term,
        academicYear,
        classLevel,
        amount,
        type: "payment",
        method,
        note,
        school: req.user.school,
        handledBy: req.user.userId,
      });
      await fee.save();

      // push to student.payments
      student.payments.push({
        academicYear,
        term,
        amount,
        category: "payment",
        type: method,
        note,
      });
      await student.save();

      results.push({ studentId: student._id, feeId: fee._id });
    }

    res.status(200).json({ message: "Bulk upload completed", results });
  } catch (err) {
    console.error("bulkUploadStudentsWithFees error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




module.exports = { addFee, getStudentFees, getOutstandingFees, getAllFees, bulkUploadFees, bulkUploadStudentsWithFees };
