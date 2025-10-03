const mongoose = require("mongoose");
const School = require("./School");
const FeeTransaction = require("./FeeTransaction");

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
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ add for audit
        recordedAt: Date, // ✅ timestamp
      },
    ],


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
  if (!school) return 0;

  const allClasses = school.classLevels.map((c) => c.name);
  const studentIndex = allClasses.indexOf(this.classLevel);

  const rule = school.feeRules.find((r) => {
    const fromIndex = allClasses.indexOf(r.fromClass);
    const toIndex = allClasses.indexOf(r.toClass);
    return (
      r.academicYear === academicYear &&
      r.term === term &&
      studentIndex >= fromIndex &&
      studentIndex <= toIndex
    );
  });

  return rule ? rule.amount : 0;
};

// Compute balance with carryover
studentSchema.methods.computeBalances = async function (academicYear) {
  const terms = ["Term 1", "Term 2", "Term 3"];
  const balances = {};
  let carryOver = 0;

  for (const term of terms) {
    const expected = await this.getExpectedFee(academicYear, term);

    // Sum transactions instead of using amtPaidTermX
    const txns = await FeeTransaction.find({ student: this._id, academicYear, term });
    const paid = txns.reduce((sum, t) => sum + t.amount, 0);

    let balance = expected - (paid + carryOver);

    if (balance <= 0) {
      carryOver = Math.abs(balance); // excess rolls to next term
      balances[term] = 0;
    } else {
      carryOver = 0;
      balances[term] = balance;
    }
  }

  // Rollover into next year
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