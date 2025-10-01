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

    console.log(txn)

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

    const { academicYear, studentId } = req.query;

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
exports.getStudentBalance = async (req, res) => {
  try {
    const { studentId } = req.params; // 👈 add this
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

exports.getStudentTransactions = async (req, res) => {
  try {
    const { studentId } = req.params; // 👈 add this

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
   🏫 Whole-School Term Summary
--------------------------------*/
exports.getSchoolTermSummary = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { academicYear, term } = req.query;

    const students = await Student.find({ school: schoolId });

    let totalExpected = 0;
    let totalPaid = 0;

    for (const student of students) {
      const expected = await student.getExpectedFee(academicYear, term);

      const txns = await FeeTransaction.find({ student: student._id, academicYear, term });
      const paid = txns.reduce((sum, t) => sum + t.amount, 0);

      totalExpected += expected;
      totalPaid += paid;
    }

    res.json({
      schoolId,
      academicYear,
      term,
      expected: totalExpected,
      paid: totalPaid,
      outstanding: totalExpected - totalPaid,
    });
  } catch (err) {
    console.error("getSchoolTermSummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   📚 Class-Level Term Summary
--------------------------------*/
exports.getClassTermSummary = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { academicYear, term, className } = req.query;

    const students = await Student.find({ school: schoolId, classLevel: className });

    let expectedTotal = 0;
    let paidTotal = 0;

    for (const student of students) {
      const expected = await student.getExpectedFee(academicYear, term);

      const txns = await FeeTransaction.find({ student: student._id, academicYear, term });
      const paid = txns.reduce((sum, t) => sum + t.amount, 0);

      expectedTotal += expected;
      paidTotal += paid;
    }

    res.json({
      className,
      academicYear,
      term,
      expected: expectedTotal,
      paid: paidTotal,
      outstanding: expectedTotal - paidTotal,
    });
  } catch (err) {
    console.error("getClassTermSummary error:", err);
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
   📈 School Term Comparison
--------------------------------*/
exports.getSchoolTermComparison = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { academicYear } = req.query;

    const terms = ["Term 1", "Term 2", "Term 3"];

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ msg: "School not found" });

    const students = await Student.find({ school: schoolId });

    const transactions = await FeeTransaction.find({
      student: { $in: students.map((s) => s._id) },
      academicYear,
    });

    const comparison = [];

    for (const term of terms) {
      // expected = sum of each student's expected fee
      const expectedList = await Promise.all(
        students.map((s) => s.getExpectedFee(academicYear, term))
      );
      const expected = expectedList.reduce((sum, e) => sum + e, 0);

      // paid = sum of all transactions for that term
      const paid = transactions
        .filter((t) => t.term === term)
        .reduce((sum, t) => sum + t.amount, 0);

      comparison.push({
        term,
        expected,
        paid,
        outstanding: expected - paid,
      });
    }

    res.json(comparison);
  } catch (err) {
    console.error("Error in getSchoolTermComparison", err);
    res.status(500).json({ msg: "Server error", error: err.message });
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
/* -------------------------------
   🚨 Debtors List (with Pagination)
--------------------------------*/
exports.getDebtors = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { academicYear, page = 1, limit = 10 } = req.query;

    const students = await Student.find({ school: schoolId });

    let debtors = [];

    for (const student of students) {
      const balances = await student.computeBalances(academicYear);

      // Term-wise outstanding
      const termBreakdown = Object.entries(balances).map(([term, data]) => ({
        term,
        outstanding: data.amount || data, // depending on how computeBalances returns
      }));

      // Total outstanding across all terms
      const totalOutstanding = termBreakdown.reduce(
        (sum, t) => sum + t.outstanding,
        0
      );

      if (totalOutstanding > 0) {
        debtors.push({
          studentId: student._id,
          name: `${student.firstName} ${student.lastName}`,
          classLevel: student.classLevel,
          totalOutstanding,
          terms: termBreakdown.filter((t) => t.outstanding > 0), // only include terms with debt
        });
      }
    }

    // Sort by highest outstanding
    debtors.sort((a, b) => b.totalOutstanding - a.totalOutstanding);

    // Pagination
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = pageInt * limitInt;

    const paginatedDebtors = debtors.slice(startIndex, endIndex);

    res.json({
      totalDebtors: debtors.length,
      totalPages: Math.ceil(debtors.length / limitInt),
      currentPage: pageInt,
      pageSize: limitInt,
      debtors: paginatedDebtors,
    });
  } catch (err) {
    console.error("getDebtors error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.onboardStudents = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { students, academicYear, term, viaCSV } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ message: "students[] is required" });
    }

    const created = [];
    const unmatched = [];

    for (const s of students) {
      let student;

      if (viaCSV) {
        // CSV upload: match by name + class
        student = await Student.findOne({
          firstName: s.firstName,
          lastName: s.lastName,
          classLevel: s.classLevel,
          school: schoolId,
        });

        if (!student) {
          unmatched.push(s);
          continue; // skip unmatched rows
        }
      } else {
        // Manual onboarding: use existing ID
        student = await Student.findById(s.studentId);
        if (!student) continue;
      }

      // Record opening balance
      if (s.openingBalance && s.openingBalance !== 0) {
        await FeeTransaction.create({
          student: student._id,
          school: schoolId,
          academicYear,
          term,
          amount: -s.openingBalance,
          type: "opening",
          method: "system",
          note: "Imported opening balance",
          handledBy: req.user.userId,
        });
      }

      created.push(student);
    }

    res.status(201).json({
      message: "Students onboarded successfully",
      count: created.length,
      students: created,
      unmatched: viaCSV ? unmatched : undefined,
    });
  } catch (err) {
    console.error("onboardStudents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
