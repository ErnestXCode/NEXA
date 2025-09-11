const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    classLevel: { type: String, required: true },
    date: { type: Date, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    academicYear: { type: String, required: true },
    term: { type: String, required: true },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
      required: true,
    },
    reason: { type: String },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Add term and academicYear to unique index to avoid E11000
attendanceSchema.index(
  { student: 1, date: 1, academicYear: 1, term: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
