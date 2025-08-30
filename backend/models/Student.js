const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  admissionNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  dateOfBirth: { type: Date, required: true },

  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  classLevel: { type: String, required: true },
  stream: { type: String },
  subjects: [{ type: String }],

  guardianName: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  guardianEmail: { type: String },
  relationship: { type: String },

  feeBalance: { type: Number, default: 0 },

  examResults: [
    {
      examName: String,
      date: Date,
      subject: String,
      score: Number,
      grade: String,
    },
  ],

  status: { type: String, enum: ["active", "suspended", "graduated", "transferred"], default: "active" },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
