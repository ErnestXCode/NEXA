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

    // ✅ sanitize amount
    let amt = Number(amount);

    if (type === "payment") {
      amt = Math.abs(amt); // always positive
    } else if (type === "adjustment") {
      amt = Number(amount); // keep + or - as entered
    }

    if (isNaN(amt)) {
      return res.status(400).json({ message: "Amount must be a valid number" });
    }

    const userId = req.user.userId; // from auth middleware

    const student = await Student.findById(studentId).populate("school");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const txn = await FeeTransaction.create({
      student: studentId,
      school: student.school._id,
      academicYear,
      term,
      amount: amt, // ⚡ use sanitized amount
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
   📋 Get All Fee Transactions (Audit)
--------------------------------*/
exports.getAllTransactions = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { academicYear, term, classLevel } = req.query;

    // Build filter
    const filter = { school: schoolId };
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    // Optional: filter by class
    let studentFilter = {};
    if (classLevel) studentFilter.classLevel = classLevel;

    const students = await Student.find({ school: schoolId, ...studentFilter });

    filter.student = { $in: students.map((s) => s._id) };

    const transactions = await FeeTransaction.find(filter)
      .populate("student", "firstName lastName classLevel")
      .populate("handledBy", "name")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error("getAllTransactions error:", err);
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
// exports.getSchoolTermSummary = async (req, res) => {
//   try {
//     const schoolId = req.user.school;
//     const { academicYear, term } = req.query;

//     const students = await Student.find({ school: schoolId });

//     let totalExpected = 0;
//     let totalPaid = 0;

//     for (const student of students) {
//       const expected = await student.getExpectedFee(academicYear, term);

//       const txns = await FeeTransaction.find({
//         student: student._id,
//         academicYear,
//         term,
//       });
//       const paid = txns.reduce((sum, t) => sum + t.amount, 0);

//       totalExpected += expected;
//       totalPaid += paid;
//     }

//     res.json({
//       schoolId,
//       academicYear,
//       term,
//       expected: totalExpected,
//       paid: totalPaid,
//       outstanding: totalExpected - totalPaid,
//     });
//   } catch (err) {
//     console.error("getSchoolTermSummary error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.getSchoolTermSummary = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { academicYear, term } = req.query;

    // keep Mongoose documents (no .lean()) so instance methods like getExpectedFee work
    const students = await Student.find({ school: schoolId });

    let totalExpected = 0;
    let totalPaid = 0;

    if (!students.length) {
      return res.json({
        schoolId,
        academicYear,
        term,
        expected: 0,
        paid: 0,
        outstanding: 0,
      });
    }

    const studentIds = students.map((s) => s._id);

    // fetch all transactions for those students in one query
    const transactions = await FeeTransaction.find({
      student: { $in: studentIds },
      academicYear,
      term,
    }).lean();

    // group totals by student id for O(1) lookup
    const txnMap = new Map();
    for (const t of transactions) {
      const sid = t.student.toString();
      txnMap.set(sid, (txnMap.get(sid) || 0) + (t.amount || 0));
    }

    // compute expected fees in parallel (preserves instance method)
    const expectedResults = await Promise.all(
      students.map((s) => s.getExpectedFee(academicYear, term))
    );

    for (let i = 0; i < students.length; i++) {
      const sid = students[i]._id.toString();
      const expected = expectedResults[i] || 0;
      const paid = txnMap.get(sid) || 0;

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

    // Keep Mongoose docs to retain instance methods like getExpectedFee()
    const students = await Student.find({
      school: schoolId,
      classLevel: className,
    });

    if (!students.length) {
      return res.json({
        className,
        academicYear,
        term,
        expected: 0,
        paid: 0,
        outstanding: 0,
      });
    }

    const studentIds = students.map((s) => s._id);

    // Fetch all relevant transactions in one query
    const transactions = await FeeTransaction.find({
      student: { $in: studentIds },
      academicYear,
      term,
    }).lean();

    // Group transactions by student for O(1) lookup
    const txnMap = new Map();
    for (const t of transactions) {
      const sid = t.student.toString();
      txnMap.set(sid, (txnMap.get(sid) || 0) + (t.amount || 0));
    }

    // Compute expected fees in parallel
    const expectedResults = await Promise.all(
      students.map((s) => s.getExpectedFee(academicYear, term))
    );

    let expectedTotal = 0;
    let paidTotal = 0;

    for (let i = 0; i < students.length; i++) {
      const sid = students[i]._id.toString();
      const expected = expectedResults[i] || 0;
      const paid = txnMap.get(sid) || 0;

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

    // keep Mongoose docs for instance methods
    const students = await Student.find({ school: schoolId });

    if (!students.length) {
      return res.json({
        schoolId,
        academicYear,
        expected: 0,
        paid: 0,
        outstanding: 0,
      });
    }

    const terms = ["Term 1", "Term 2", "Term 3"];

    // Run all expected fees and balances in parallel for each student
    const results = await Promise.all(
      students.map(async (student) => {
        // Run 3 term expected fees in parallel
        const expectedFees = await Promise.all(
          terms.map((term) => student.getExpectedFee(academicYear, term))
        );

        const expected = expectedFees.reduce((sum, v) => sum + (v || 0), 0);

        // Compute balances once
        const balances = await student.computeBalances(academicYear);

        const totalBalance = Object.values(balances).reduce(
          (a, b) => a + (b.amount || b || 0),
          0
        );

        const paid = expected - totalBalance;

        return { expected, paid };
      })
    );

    // Aggregate totals
    const totalExpected = results.reduce((sum, r) => sum + r.expected, 0);
    const totalPaid = results.reduce((sum, r) => sum + r.paid, 0);

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

    // Keep mongoose documents for instance methods
    const students = await Student.find({ school: schoolId });

    if (!students.length) {
      return res.json(
        terms.map((term) => ({
          term,
          expected: 0,
          paid: 0,
          outstanding: 0,
        }))
      );
    }

    const studentIds = students.map((s) => s._id);

    // Fetch all term transactions in one query (no N+1)
    const transactions = await FeeTransaction.find({
      student: { $in: studentIds },
      academicYear,
    }).lean();

    // Pre-group transaction totals by term for O(1) lookup later
    const termPaidMap = new Map();
    for (const txn of transactions) {
      const key = txn.term;
      termPaidMap.set(key, (termPaidMap.get(key) || 0) + (txn.amount || 0));
    }

    // Compute expected fees for all terms in parallel
    const expectedResults = {};
    await Promise.all(
      terms.map(async (term) => {
        const expectedList = await Promise.all(
          students.map((s) => s.getExpectedFee(academicYear, term))
        );
        expectedResults[term] = expectedList.reduce(
          (sum, e) => sum + (e || 0),
          0
        );
      })
    );

    // Build final comparison array
    const comparison = terms.map((term) => {
      const expected = expectedResults[term] || 0;
      const paid = termPaidMap.get(term) || 0;
      return {
        term,
        expected,
        paid,
        outstanding: expected - paid,
      };
    });

    res.json(comparison);
  } catch (err) {
    console.error("Error in getSchoolTermComparison", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/* -------------------------------
   📚 Class-Level Breakdown
--------------------------------*/
// exports.getClassSummary = async (req, res) => {
//   try {

//     const schoolId = req.user.school;
//     const { academicYear } = req.query;

//     const students = await Student.find({ school: schoolId });

//     const summary = {};

//     const terms = ["Term 1", "Term 2", "Term 3"];

//     for (const student of students) {
//       const classLevel = student.classLevel;

//       if (!summary[classLevel]) {
//         summary[classLevel] = {};
//         terms.forEach((term) => {
//           summary[classLevel][term] = { expected: 0, paid: 0, outstanding: 0 };
//         });
//       }

//       const balances = await student.computeBalances(academicYear);

//       for (const term of terms) {
//         const expected = await student.getExpectedFee(academicYear, term);
//         const termBalance = balances[term] || 0;
//         const paid = expected - termBalance;

//         summary[classLevel][term].expected += expected;
//         summary[classLevel][term].paid += paid;
//         summary[classLevel][term].outstanding += termBalance;
//       }
//     }

//     res.json(summary);
//   } catch (err) {
//     console.error("getClassSummary error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.getClassSummary = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { academicYear } = req.query;

    // keep mongoose documents so instance methods work
    const students = await Student.find({ school: schoolId });

    const summary = {};
    const terms = ["Term 1", "Term 2", "Term 3"];

    if (!students.length) {
      return res.json(summary);
    }

    // compute balances and expected fees in parallel for all students
    const balancePromises = students.map((s) =>
      s.computeBalances(academicYear)
    );
    const balanceResults = await Promise.all(balancePromises);

    // For each term, compute all expected fees in parallel too
    const expectedFeePromises = {};
    for (const term of terms) {
      expectedFeePromises[term] = Promise.all(
        students.map((s) => s.getExpectedFee(academicYear, term))
      );
    }

    const expectedFeeResults = {};
    for (const term of terms) {
      expectedFeeResults[term] = await expectedFeePromises[term];
    }

    // combine results
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const classLevel = student.classLevel || "Unknown";

      if (!summary[classLevel]) {
        summary[classLevel] = {};
        for (const term of terms) {
          summary[classLevel][term] = { expected: 0, paid: 0, outstanding: 0 };
        }
      }

      const balances = balanceResults[i] || {};

      for (const term of terms) {
        const expected = expectedFeeResults[term][i] || 0;
        const termBalance = balances[term] || 0;
        const paid = expected - termBalance;

        summary[classLevel][term].expected += expected;
        summary[classLevel][term].paid += paid;
        summary[classLevel][term].outstanding += termBalance;
      }
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
// ✅ Enhanced Debtors Controller with Filters

exports.getDebtors = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const {
      academicYear,
      classLevel, // e.g. "Grade 1"
      minOutstanding = 0,
      maxOutstanding,
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    const students = await Student.find({
      school: schoolId,
      ...(classLevel ? { classLevel } : {}),
      ...(search
        ? {
            $or: [
              { firstName: new RegExp(search, "i") },
              { lastName: new RegExp(search, "i") },
            ],
          }
        : {}),
    });

    let debtors = [];

    for (const student of students) {
      const balances = await student.computeBalances(academicYear);

      const termBreakdown = Object.entries(balances).map(([term, data]) => ({
        term,
        outstanding: data.amount || data,
      }));

      const totalOutstanding = termBreakdown.reduce(
        (sum, t) => sum + t.outstanding,
        0
      );

      if (
        totalOutstanding > Number(minOutstanding) &&
        (!maxOutstanding || totalOutstanding <= Number(maxOutstanding))
      ) {
        debtors.push({
          studentId: student._id,
          name: `${student.firstName} ${student.lastName}`,
          classLevel: student.classLevel,
          totalOutstanding,
          terms: Array.isArray(termBreakdown)
            ? termBreakdown.filter((t) => t.outstanding > 0)
            : [],
        });
      }
    }

    debtors.sort((a, b) => b.totalOutstanding - a.totalOutstanding);

    // Pagination
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const startIndex = (pageInt - 1) * limitInt;
    const paginatedDebtors = debtors.slice(startIndex, startIndex + limitInt);

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
          term: s.term || term,
          amount: s.openingBalance,
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

/* -------------------------------
   ❌ Delete a Fee Rule
--------------------------------*/
exports.deleteFeeRule = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { ruleId } = req.params;

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    // Pull removes matching object by _id
    school.feeRules = school.feeRules.filter(
      (rule) => rule._id.toString() !== ruleId
    );

    await school.save();

    res.json({ message: "Fee rule deleted", feeRules: school.feeRules });
  } catch (err) {
    console.error("deleteFeeRule error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
