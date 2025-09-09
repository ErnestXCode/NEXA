const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classLevel: { type: String, required: true },
    date: { type: Date, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" , required: true},

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
      required: true
    },
    reason: { type: String },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
