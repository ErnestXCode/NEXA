const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const School = require("../../models/School");
const User = require("../../models/User");

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
const addFee = async (req, res) => {
  try {
    const {
      studentId,
      amount,
      term,
      type = "payment",
      method = "cash",
      note,
      generateReceipt = false,
    } = req.body;

    const requester = req.user;

    // Find student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

   
   
    const school = await School.findById(student.school);

    // Validate term exists in school expectations
    const termExpectation = school.feeExpectations.find((f) => f.term === term);
    if (!termExpectation)
      return res.status(400).json({ msg: `Term ${term} not set in school` });

    // Create Fee record
    const feeRecord = new Fee({
      student: student._id,
      term,
      classLevel: student.classLevel,
      amount,
      type,
      method,
      note,
      handledBy: requester.userId,
      school: school._id,
      receiptGenerated: generateReceipt,
    });
    await feeRecord.save();

    // ALSO update student.payments array
    student.payments.push({
      term,
      amount,
      category: type, // "payment" or "adjustment"
      type: method, // "cash", "mpesa", "card"
      note,
      date: new Date(),
    });
    await student.save();

    res
      .status(200)
      .json({ msg: "Fee recorded successfully", feeRecord, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error adding fee", error: err.message });
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
const getOutstandingFees = async (req, res) => {
  try {
    const { term, classLevel } = req.query;
    const schoolQuery =
      req.user.role === "superadmin" ? {} : { school: req.user.school };
    const studentQuery = { ...schoolQuery };
    if (classLevel) studentQuery.classLevel = classLevel;

    const students = await Student.find(studentQuery).populate("school");
    let totalOutstanding = 0;

    for (const s of students) {
      // ensure we have the school doc (populated or fetch)
      let school = s.school;
      if (!school || !school.classLevels) {
        school = await School.findById(s.school);
      }

      // priority of expectation sources:
      // 1) feeRules (ranges)
      // 2) class-level feeExpectations
      // 3) school.feeExpectations (fallback)
      let expectations = [];

      const allClassLevels = (school.classLevels || []).map((c) => ({ name: c.name }));

      // find matching rules (if any)
      if (Array.isArray(school.feeRules) && school.feeRules.length) {
        const matchedRules = school.feeRules.filter((rule) =>
          isClassInRange(s.classLevel, rule.fromClass, rule.toClass, school.classLevels)
        );
        if (matchedRules.length) {
          expectations = matchedRules; // each has { fromClass,toClass,term,amount }
        }
      }

      // if no matched rules, check class-level expectations
      if (!expectations.length) {
        const classDef = (school.classLevels || []).find((c) => c.name === s.classLevel);
        if (classDef && Array.isArray(classDef.feeExpectations) && classDef.feeExpectations.length) {
          expectations = classDef.feeExpectations;
        } else {
          expectations = school.feeExpectations || [];
        }
      }

      if (term) {
        // term-specific calculation
        const expected = expectations.find((f) => f.term === term)?.amount || 0;
        const payments = await Fee.find({ student: s._id, term });

        const paid = payments
          .filter((p) => p.type === "payment")
          .reduce((sum, p) => sum + p.amount, 0);
        const adjustments = payments
          .filter((p) => p.type === "adjustment")
          .reduce((sum, p) => sum + p.amount, 0);
        totalOutstanding += expected - paid + adjustments;
      } else {
        // full-year (or all terms) calculation — iterate expectations available
        for (const t of expectations) {
          const expectedAmount = t.amount || 0;
          const payments = await Fee.find({ student: s._id, term: t.term });

          const paid = payments
            .filter((p) => p.type === "payment")
            .reduce((sum, p) => sum + p.amount, 0);
          const adjustments = payments
            .filter((p) => p.type === "adjustment")
            .reduce((sum, p) => sum + p.amount, 0);

          totalOutstanding += expectedAmount - paid + adjustments;
        }
      }
    }

    res.status(200).json({ totalOutstanding });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Error fetching outstanding fees", error: err.message });
  }
};

module.exports = { addFee, getStudentFees, getOutstandingFees, getAllFees };
