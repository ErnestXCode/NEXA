const mongoose = require("mongoose");
const School = require("./School");

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    dateOfBirth: { type: Date, required: true },
    classLevel: { type: String, required: true },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    stream: { type: String },
    subjects: [{ type: String }],
    guardian: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 💰 Payments made
    payments: [
      {
        academicYear: { type: String, required: true }, // 🔹 string format 2025/2026
        term: {
          type: String,
          enum: ["Term 1", "Term 2", "Term 3"],
          required: true,
        },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        category: {
          type: String,
          enum: ["payment", "adjustment"],
          required: true,
        },
        type: {
          type: String,
          enum: ["cash", "mpesa", "card", "bank"],
          default: "cash",
        },
        note: String,
      },
    ],

    // 📊 Fee expectations (student-level overrides if any)
    feeStructures: [
      {
        academicYear: { type: String, required: true },
        term: {
          type: String,
          enum: ["Term 1", "Term 2", "Term 3"],
          required: true,
        },
        expected: { type: Number, required: true },
      },
    ],

    // 📚 Exam results
    examResults: [
      {
        exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        academicYear: { type: String },
        term: String,
        subjects: [
          {
            name: String,
            score: Number,
            grade: String, // 🔹 CBC grade e.g. ME1
            remark: String, // 🔹 remark from grading system
          },
        ],
        // Transitional totals (for schools still used to 8-4-4 style)
        total: Number,
        average: Number,
        grade: String, // overall grade (optional in CBC, keep for now)
        remark: String, // overall remark
      },
    ],

    amtPaidTerm1: { type: Number, default: 0 },
    amtPaidTerm2: { type: Number, default: 0 },
    amtPaidTerm3: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "suspended", "graduated", "transferred"],
      default: "active",
    },
  },
  { timestamps: true }
);

/* -------------------------------
   📌 Methods for Fees & Balances
--------------------------------*/

// Get expected fee for a student for a term
studentSchema.methods.getExpectedFee = async function (academicYear, term) {
  const school = await School.findById(this.school).lean();

  // 1. Student-level override
  const override = this.feeStructures.find(
    (f) => f.academicYear === academicYear && f.term === term
  );
  if (override) return override.expected;

  // 2. School feeRule
  const allClasses = school.classLevels.map((c) => c.name);
  const studentIndex = allClasses.indexOf(this.classLevel);

  const feeRule = school.feeRules.find((rule) => {
    const fromIndex = allClasses.indexOf(rule.fromClass);
    const toIndex = allClasses.indexOf(rule.toClass);
    if (studentIndex === -1 || fromIndex === -1 || toIndex === -1) return false;
    return (
      studentIndex >= fromIndex && studentIndex <= toIndex && rule.term === term
    ); // ✅ remove academicYear check if not in DB
  });

  if (feeRule) return feeRule.amount;

  // 3. School feeExpectations
  const feeExp = school.feeExpectations.find(
    (exp) => exp.academicYear === academicYear && exp.term === term
  );

  return feeExp ? feeExp.amount : 0;
};

// Compute balances for all terms with rollover

studentSchema.methods.computeBalances = async function (academicYear) {
  const terms = ["Term 1", "Term 2", "Term 3"];
  const balances = {};
  let carryOver = 0;

  for (const term of terms) {
    const expected = await this.getExpectedFee(academicYear, term);

    // 🔹 Use persisted amtPaidTermX instead of summing payments
    const paid =
      term === "Term 1" ? this.amtPaidTerm1 :
      term === "Term 2" ? this.amtPaidTerm2 :
      term === "Term 3" ? this.amtPaidTerm3 : 0;

    let balance = expected - (paid + carryOver);

    if (balance <= 0) {
      carryOver = Math.abs(balance); // rollover excess
      balances[term] = 0;
    } else {
      carryOver = 0;
      balances[term] = balance;
    }
  }

  // rollover into next year Term 1 if excess remains
  if (carryOver > 0) {
    const [start, end] = academicYear.split("/").map((y) => parseInt(y));
    balances["rollover"] = {
      academicYear: `${start + 1}/${end + 1}`,
      term: "Term 1",
      amount: carryOver,
    };
  }

  return balances;
};


module.exports = mongoose.model("Student", studentSchema);
