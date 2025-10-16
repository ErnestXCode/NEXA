const FeeTransaction = require("../../models/FeeTransaction");
const Student = require("../../models/Student");
const School = require("../../models/School");
const StudentCredit = require("../../models/StudentCredit");

exports.recordTransaction = async (req, res) => {
  console.time("recordTransaction");
  try {
    const { studentId, academicYear, term, amount, type, method, note } =
      req.body;
    const userId = req.user.userId;

    // ✅ sanitize amount
    let amt = Number(amount);
    if (type === "payment") amt = Math.abs(amt);
    else if (type === "adjustment") amt = Number(amount);
    if (isNaN(amt))
      return res.status(400).json({ message: "Amount must be a valid number" });

    // ✅ get student + school
    const student = await Student.findById(studentId).populate("school");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // ✅ expected fee + already paid for this term
    const expected = await student.getExpectedFee(academicYear, term);
    const currentPaid = await FeeTransaction.aggregate([
      { $match: { student: student._id, academicYear, term } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const alreadyPaid = currentPaid[0]?.total || 0;

    // ✅ how much fits this term
    let toApply = Math.min(amt, Math.max(0, expected - alreadyPaid));
    let excess = amt - toApply;

    // ✅ record this term’s transaction
    const txn = await FeeTransaction.create({
      student: studentId,
      school: student.school._id,
      academicYear,
      term,
      amount: toApply,
      type,
      method,
      note,
      handledBy: userId,
    });

    // 🌀 carry over excess to next terms or next year
    const terms = ["Term 1", "Term 2", "Term 3"];
    let currentYear = academicYear;
    let nextTermIndex = terms.indexOf(term) + 1;

    while (excess > 0) {
      // ✅ reached beyond Term 3 → move to next year
    
      if (nextTermIndex >= terms.length) {
        const [startY, endY] = currentYear.split("/").map(Number);
        const nextYear = `${startY + 1}/${endY + 1}`;
      console.log('-----------------------------------', 'we have next year', nextYear)


        // Log a transaction in the *next year* for traceability
        await FeeTransaction.create({
          student: student._id,
          school: student.school._id,
          academicYear: nextYear, // 🟢 changed from currentYear
          term: "Term 1",
          amount: excess,
          type,
          method,
          note: `Carryover credit from ${academicYear} ${term}`,
          handledBy: userId,
        });

        // And record an actual credit document too
        await StudentCredit.create({
          student: student._id,
          school: student.school._id,
          academicYear: nextYear,
          term: "Term 1",
          amount: excess,
          source: `Overpayment from ${academicYear} ${term}`,
          createdBy: userId,
        });

        break;
      }

      // ✅ next term within the same year
      const nextTerm = terms[nextTermIndex];
      

      const nextExpected = await student.getExpectedFee(currentYear, nextTerm);
      

      if (!nextExpected || nextExpected <= 0) break;

    


      const nextPaid = await FeeTransaction.aggregate([
        {
          $match: {
            student: student._id,
            academicYear: currentYear,
            term: nextTerm,
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      console.log('-----------------------------------', 'we have nextPaid', nextPaid)


      const nextAlreadyPaid = nextPaid[0]?.total || 0;
      const nextRoom = Math.max(0, nextExpected - nextAlreadyPaid);

      const applied = Math.min(excess, nextRoom);
      excess -= applied;

      console.log('-----------------------------------', 'we have applied', applied)


      if (applied > 0) {
        await FeeTransaction.create({
          student: student._id,
          school: student.school._id,
          academicYear: currentYear,
          term: nextTerm,
          amount: applied,
          type,
          method,
          note: `Carryover from ${academicYear} ${term}`,
          handledBy: userId,
        });
      }

      nextTermIndex++;
    }

    console.timeEnd("recordTransaction");
    res.status(201).json({
      message: "Transaction recorded successfully",
      txn,
    });
  } catch (err) {
    console.error("recordTransaction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   📋 Get All Fee Transactions (Audit)
--------------------------------*/
exports.getAllTransactions = async (req, res) => {
  console.time("getAllTransaction");

  try {
    const schoolId = req.user.school;
    const { academicYear, term, classLevel, page = 1, limit = 20 } = req.query;

    const filter = { school: schoolId };
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    let studentFilter = {};
    if (classLevel) studentFilter.classLevel = classLevel;

    const students = await Student.find({ school: schoolId, ...studentFilter });

    filter.student = { $in: students.map((s) => s._id) };

    const skip = (Number(page) - 1) * Number(limit);

    // Get paginated transactions
    const [transactions, total] = await Promise.all([
      FeeTransaction.find(filter)
        .populate("student", "firstName lastName classLevel")
        .populate("handledBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      FeeTransaction.countDocuments(filter),
    ]);

    console.timeEnd("getAllTransaction");

    res.json({
      transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("getAllTransactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   📊 Get Balance for a Student
--------------------------------*/
// exports.getStudentBalance = async (req, res) => {
//   console.time("getStudentBalance");

//   try {
//     const schoolId = req.user.school;

//     const { academicYear, studentId } = req.query;

//     const student = await Student.findById(studentId);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     const balances = await student.computeBalances(academicYear);

//     console.timeEnd("getStudentBalance");

//     res.json({ studentId, academicYear, balances });
//   } catch (err) {
//     console.error("getStudentBalance error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

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

exports.getSchoolTermSummary = async (req, res) => {
  console.time("schoolTermSummary");

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

    console.timeEnd("schoolTermSummary");

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
  console.time("classTermSummary");

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
    console.timeEnd("classTermSummary");

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
  console.time("schoolSummary");
  try {
    const schoolId = req.user.school;
    const { academicYear } = req.query;
    const terms = ["Term 1", "Term 2", "Term 3"];

    // ✅ 1. Load everything in parallel — only 3 queries
    const [students, school, transactions] = await Promise.all([
      Student.find({ school: schoolId }).lean(),
      School.findById(schoolId).lean(),
      FeeTransaction.find({ school: schoolId, academicYear }).lean(),
    ]);

    if (!students.length) {
      console.timeEnd("schoolSummary");
      return res.json({
        schoolId,
        academicYear,
        expected: 0,
        paid: 0,
        outstanding: 0,
      });
    }

    // ✅ 2. Prepare helper structures
    const allClasses = school.classLevels.map((c) => c.name);

    // Fee rules for the year
    const feeRules = school.feeRules.filter(
      (r) => r.academicYear === academicYear
    );

    // Precompute expected fee per class + term
    const expectedMap = {};
    for (const rule of feeRules) {
      const fromIdx = allClasses.indexOf(rule.fromClass);
      const toIdx = allClasses.indexOf(rule.toClass);
      for (let i = fromIdx; i <= toIdx; i++) {
        const className = allClasses[i];
        if (!expectedMap[className]) expectedMap[className] = {};
        expectedMap[className][rule.term] = rule.amount;
      }
    }

    // Group all payments by student + term
    const txnMap = {};
    for (const txn of transactions) {
      const key = `${txn.student}_${txn.term}`;
      txnMap[key] = (txnMap[key] || 0) + txn.amount;
    }

    // ✅ 3. Compute school-wide totals
    let totalExpected = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    for (const student of students) {
      let carryOver = 0;
      for (const term of terms) {
        const expected = expectedMap[student.classLevel]?.[term] || 0;

        const paid = txnMap[`${student._id}_${term}`] || 0;
        const balance = Math.max(0, expected - (paid + carryOver));
        carryOver = balance <= 0 ? Math.abs(balance) : 0;

        totalExpected += expected;
        totalPaid += paid;
        totalOutstanding += balance;
      }
    }

    console.timeEnd("schoolSummary");

    res.json({
      schoolId,
      academicYear,
      expected: totalExpected,
      paid: totalPaid,
      outstanding: totalOutstanding,
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
  console.time("schoolTermComparison");

  try {
    const schoolId = req.user.school;
    const { academicYear } = req.query;
    const terms = ["Term 1", "Term 2", "Term 3"];

    const school = await School.findById(schoolId).lean();
    if (!school) return res.status(404).json({ msg: "School not found" });

    // ✅ Fetch all students once
    const students = await Student.find({ school: schoolId })
      .select("classLevel")
      .lean();

    if (!students.length) {
      console.timeEnd("schoolTermComparison");
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

    // ✅ Fetch all term transactions in one query
    const transactions = await FeeTransaction.find({
      student: { $in: studentIds },
      academicYear,
    }).lean();

    // ✅ Pre-group transactions by term
    const termPaidMap = new Map();
    for (const txn of transactions) {
      const key = txn.term;
      termPaidMap.set(key, (termPaidMap.get(key) || 0) + (txn.amount || 0));
    }

    // ✅ Preprocess classLevel index mapping once
    const classNames = school.classLevels.map((c) => c.name);
    const classIndexMap = new Map(classNames.map((c, i) => [c, i]));

    // ✅ Pre-group feeRules for quick lookup
    const feeRules = school.feeRules.filter(
      (r) => r.academicYear === academicYear
    );

    const expectedResults = {};
    for (const term of terms) {
      const rulesForTerm = feeRules.filter((r) => r.term === term);
      let totalExpected = 0;

      for (const s of students) {
        const studentIndex = classIndexMap.get(s.classLevel);
        if (studentIndex === undefined) continue;

        const rule = rulesForTerm.find((r) => {
          const fromIndex = classIndexMap.get(r.fromClass);
          const toIndex = classIndexMap.get(r.toClass);
          return (
            fromIndex !== undefined &&
            toIndex !== undefined &&
            studentIndex >= fromIndex &&
            studentIndex <= toIndex
          );
        });

        totalExpected += rule ? rule.amount : 0;
      }

      expectedResults[term] = totalExpected;
    }

    // ✅ Construct final response
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

    console.timeEnd("schoolTermComparison");
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
  // console.time("classSummary");
  try {
    const schoolId = req.user.school;
    const { academicYear } = req.query;
    const terms = ["Term 1", "Term 2", "Term 3"];
    const summary = {};

    // ✅ Load everything in 3 bulk queries
    const [students, school, transactions] = await Promise.all([
      Student.find({ school: schoolId }).lean(),
      School.findById(schoolId).lean(),
      FeeTransaction.find({ school: schoolId, academicYear }).lean(),
    ]);

    if (!students.length) {
      // console.timeEnd("classSummary");
      return res.json(summary);
    }

    // 🔹 Map classLevels for quick rule lookup
    const allClasses = school.classLevels.map((c) => c.name);

    // 🔹 Group fee rules by term for faster access
    const feeRules = school.feeRules.filter(
      (r) => r.academicYear === academicYear
    );

    // 🔹 Group transactions by student+term
    const txnMap = {};
    for (const txn of transactions) {
      const key = `${txn.student}_${txn.term}`;
      txnMap[key] = (txnMap[key] || 0) + txn.amount;
    }

    // 🔹 Precompute expected fee per classLevel+term
    const expectedMap = {};
    for (const rule of feeRules) {
      const fromIdx = allClasses.indexOf(rule.fromClass);
      const toIdx = allClasses.indexOf(rule.toClass);
      for (let i = fromIdx; i <= toIdx; i++) {
        const className = allClasses[i];
        if (!expectedMap[className]) expectedMap[className] = {};
        expectedMap[className][rule.term] = rule.amount;
      }
    }

    // 🔹 Compute summary by classLevel
    for (const student of students) {
      const classLevel = student.classLevel || "Unknown";
      if (!summary[classLevel]) {
        summary[classLevel] = {};
        for (const term of terms) {
          summary[classLevel][term] = { expected: 0, paid: 0, outstanding: 0 };
        }
      }

      let carryOver = 0;

      for (const term of terms) {
        const expected = expectedMap[student.classLevel]?.[term] || 0;

        const paid = txnMap[`${student._id}_${term}`] || 0;
        const balance = Math.max(0, expected - (paid + carryOver));
        carryOver = balance <= 0 ? Math.abs(balance) : 0;

        summary[classLevel][term].expected += expected;
        summary[classLevel][term].paid += paid;
        summary[classLevel][term].outstanding += balance;
      }
    }

    // console.timeEnd("classSummary");
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
  // console.time("debtors");

  try {
    const schoolId = req.user.school;
    const {
      academicYear,
      classLevel,
      minOutstanding = 0,
      maxOutstanding,
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    // 1️⃣ Fetch all students (lightweight query)
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
    }).lean();

    if (!students.length) {
      // console.timeEnd("debtors");
      return res.json({
        totalDebtors: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: parseInt(limit),
        debtors: [],
      });
    }

    // 2️⃣ Fetch all FeeTransactions for the academicYear at once
    const allTxns = await FeeTransaction.find({
      school: schoolId,
      academicYear,
    }).lean();

    // Group transactions by student + term
    const txnsByStudent = {};
    for (const t of allTxns) {
      if (!txnsByStudent[t.student]) txnsByStudent[t.student] = {};
      if (!txnsByStudent[t.student][t.term])
        txnsByStudent[t.student][t.term] = 0;
      txnsByStudent[t.student][t.term] += t.amount;
    }

    // 3️⃣ Fetch school once, build fee lookup
    const school = await School.findById(schoolId).lean();
    const allClasses = school.classLevels.map((c) => c.name);
    const feeLookup = {};

    for (const rule of school.feeRules) {
      if (rule.academicYear !== academicYear) continue;

      const fromIndex = allClasses.indexOf(rule.fromClass);
      const toIndex = allClasses.indexOf(rule.toClass);

      for (let i = fromIndex; i <= toIndex; i++) {
        feeLookup[`${allClasses[i]}-${rule.term}`] = rule.amount;
      }
    }

    // 4️⃣ Compute balances in memory
    const terms = ["Term 1", "Term 2", "Term 3"];
    const debtors = [];

    for (const student of students) {
      let carryOver = 0;
      const termBreakdown = [];

      for (const term of terms) {
        const expected = feeLookup[`${student.classLevel}-${term}`] || 0;
        const paid = txnsByStudent[student._id]?.[term] || 0;

        let balance = expected - (paid + carryOver);

        if (balance <= 0) {
          carryOver = Math.abs(balance);
          balance = 0;
        } else {
          carryOver = 0;
        }

        termBreakdown.push({ term, outstanding: balance });
      }

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
          terms: termBreakdown.filter((t) => t.outstanding > 0),
        });
      }
    }

    // 5️⃣ Sort & paginate
    debtors.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const startIndex = (pageInt - 1) * limitInt;
    const paginatedDebtors = debtors.slice(startIndex, startIndex + limitInt);

    // console.timeEnd("debtors");
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
  // console.time("onboarding");
  try {
    const schoolId = req.user.school;
    const { students, academicYear, term, viaCSV } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ message: "students[] is required" });
    }

    const created = [];
    const unmatched = [];
    const transactions = [];

    if (viaCSV) {
      // 🔹 Build a unique key for each input student to allow O(1) matching
      const key = (s) =>
        `${(s.firstName || "").trim().toLowerCase()}-${(s.lastName || "")
          .trim()
          .toLowerCase()}-${(s.classLevel || "").trim().toLowerCase()}`;

      // 🔹 Build sets for lookup
      const wantedKeys = new Set(students.map(key));

      // 🔹 Fetch all relevant students in one query
      const foundStudents = await Student.find({ school: schoolId })
        .select("firstName lastName classLevel _id")
        .lean();

      // 🔹 Create a hash map for fast lookup
      const foundMap = new Map();
      for (const st of foundStudents) {
        const k = key(st);
        if (wantedKeys.has(k)) foundMap.set(k, st);
      }

      // 🔹 Build transactions array in memory
      for (const s of students) {
        const k = key(s);
        const student = foundMap.get(k);
        if (!student) {
          unmatched.push(s);
          continue;
        }

        if (s.openingPaid && s.openingPaid !== 0) {
          transactions.push({
            student: student._id,
            school: schoolId,
            academicYear,
            term: s.term || term,
            amount: s.openingPaid,
            type: "opening",
            method: "system",
            note: "Imported opening balance",
            handledBy: req.user.userId,
          });
        }

        created.push(student);
      }
    } else {
      // 🔹 Manual onboarding
      const studentIds = students.map((s) => s.studentId);
      const foundStudents = await Student.find({
        _id: { $in: studentIds },
      })
        .select("_id")
        .lean();

      const foundSet = new Set(foundStudents.map((s) => s._id.toString()));

      for (const s of students) {
        if (!foundSet.has(s.studentId)) continue;

        if (s.openingPaid && s.openingPaid !== 0) {
          transactions.push({
            student: s.studentId,
            school: schoolId,
            academicYear,
            term: s.term || term,
            amount: s.openingPaid,
            type: "opening",
            method: "system",
            note: "Imported opening balance",
            handledBy: req.user.userId,
          });
        }

        created.push({ _id: s.studentId });
      }
    }

    // 🔹 Perform a single bulk insert for all transactions
    if (transactions.length > 0) {
      await FeeTransaction.insertMany(transactions, { ordered: false });
    }
    // console.timeEnd("onboarding");

    res.status(201).json({
      message: "Students onboarded successfully",
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

exports.updateFeeRule = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { ruleId } = req.params;
    const updatedData = req.body;

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    // Find the rule by ID
    const ruleIndex = school.feeRules.findIndex(
      (rule) => rule._id.toString() === ruleId
    );
    if (ruleIndex === -1)
      return res.status(404).json({ message: "Fee rule not found" });

    // Update only provided fields
    school.feeRules[ruleIndex] = {
      ...school.feeRules[ruleIndex]._doc,
      ...updatedData,
    };

    await school.save();

    res.json({
      message: "Fee rule updated successfully",
      feeRules: school.feeRules,
    });
  } catch (err) {
    console.error("updateFeeRule error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getStudentLogs = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [transactions, credits] = await Promise.all([
      FeeTransaction.find({ student: studentId })
        .populate("handledBy", "name")
        .sort({ createdAt: -1 }),
      StudentCredit.find({ student: studentId }).sort({ createdAt: -1 }),
    ]);

    res.json({
      transactions,
      credits,
    });
  } catch (err) {
    console.error("getStudentLogs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/feeController.js
exports.getStudentFeeHistory = async (req, res) => {
  // console.time("getStudentFeeHistory");
  try {
    const schoolId = req.user.school;
    const { studentId } = req.params;

    // Verify student belongs to the school
    const student = await Student.findOne({
      _id: studentId,
      school: schoolId,
    }).lean();

    if (!student) {
      // console.timeEnd("getStudentFeeHistory");
      return res
        .status(404)
        .json({ message: "Student not found or not in your school" });
    }

    // console.log("student---------", student);

    // Fetch all transactions for that student — all years, all terms
    const transactions = await FeeTransaction.find({
      student: studentId,
      school: schoolId,
    })
      .populate("handledBy", "name email") // optional, but helpful for context
      .sort({ createdAt: -1 }) // most recent first
      .lean();

    // console.log("trans------", transactions);

    // Compute totals for quick overview
    const totalPaid = transactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAdjustments = transactions
      .filter((t) => t.type === "adjustment")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFines = transactions
      .filter((t) => t.type === "fine")
      .reduce((sum, t) => sum + t.amount, 0);

    // console.timeEnd("getStudentFeeHistory");

    res.json({
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        classLevel: student.classLevel,
      },
      totals: {
        paid: totalPaid,
        adjustments: totalAdjustments,
        fines: totalFines,
      },
      totalTransactions: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error("getStudentFeeHistory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// controllers/feeController.js
exports.getStudentsByClass = async (req, res) => {
  try {
    const schoolId = req.user.school;
    console.log('hit-----------------------------')
    const { classLevel, academicYear } = req.query;
    console.log(req.query)

    if (!classLevel) 
      return res.status(400).json({ message: "classLevel is required" });

    // 1️⃣ Fetch all students in the class
    const students = await Student.find({ school: schoolId, classLevel }).lean();
    if (!students.length) return res.json({ students: [] });

    const studentIds = students.map(s => s._id);

    // 2️⃣ Fetch all FeeTransactions for these students in the given year
    const transactions = await FeeTransaction.find({
      student: { $in: studentIds },
      academicYear,
    }).lean();

    // Map transactions by student + term
    const txnMap = {};
    for (const t of transactions) {
      if (!txnMap[t.student]) txnMap[t.student] = {};
      txnMap[t.student][t.term] = (txnMap[t.student][t.term] || 0) + t.amount;
    }

    // 3️⃣ Build fee lookup from school's fee rules
    const school = await School.findById(schoolId).lean();
    const allClasses = school.classLevels.map(c => c.name);
    const expectedMap = {};

    for (const rule of school.feeRules.filter(r => r.academicYear === academicYear)) {
      const fromIdx = allClasses.indexOf(rule.fromClass);
      const toIdx = allClasses.indexOf(rule.toClass);

      for (let i = fromIdx; i <= toIdx; i++) {
        const className = allClasses[i];
        if (!expectedMap[className]) expectedMap[className] = {};
        expectedMap[className][rule.term] = rule.amount;
      }
    }

    const terms = ["Term 1", "Term 2", "Term 3"];

    // 4️⃣ Compute balances for each student
    const studentSummaries = students.map(student => {
      let carryOver = 0;

      const termBreakdown = terms.map(term => {
        const expected = expectedMap[student.classLevel]?.[term] || 0;
        const paid = txnMap[student._id]?.[term] || 0;

        let balance = expected - (paid + carryOver);

        if (balance <= 0) {
          carryOver = Math.abs(balance);
          balance = 0;
        } else {
          carryOver = 0;
        }

        return { term, expected, paid, outstanding: balance };
      });

      const totalOutstanding = termBreakdown.reduce((sum, t) => sum + t.outstanding, 0);

      return {
        studentId: student._id,
        name: `${student.firstName} ${student.lastName}`,
        classLevel: student.classLevel,
        totalOutstanding,
        terms: termBreakdown
      };
    });

    // 5️⃣ Send all students, even if totalOutstanding is 0
    res.json({ students: studentSummaries });

  } catch (err) {
    console.error("getStudentsByClass error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

