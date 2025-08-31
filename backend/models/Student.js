// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  admissionNumber: { type: String, required: true },
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

  feeExpectations: [
    {
      term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
      amount: { type: Number, default: 0 },
    }
  ],

  payments: [
    {
      term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      type: { type: String, enum: ["cash", "mpesa", "card"], default: "cash" },
      note: String,
    }
  ],

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
