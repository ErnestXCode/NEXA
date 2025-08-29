const mongoose = require("mongoose");


const studentSchema = new mongoose.Schema(
  {
    // 🔑 Identity
    admissionNumber: { type: String, required: true, unique: true }, // student ID
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    dateOfBirth: { type: Date, required: true },

    // 🎓 Academic Info
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    classLevel: { type: String, required: true }, // e.g., "Grade 8", "Form 2"
    stream: { type: String }, // e.g., "Blue", "A", "West Wing"
    subjects: [{ type: String }], // list of enrolled subjects

    // 👨‍👩‍👧 Guardian / Parent Info
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    guardianEmail: { type: String },
    relationship: { type: String }, // e.g., "Father", "Mother", "Uncle"

    // 💰 Fees & Finance
    feeBalance: { type: Number, default: 0 },

    // 📊 Performance / Records
    examResults: [
      {
        examName: String,
        date: Date,
        subject: String,
        score: Number,
        grade: String,
      },
    ],

    // ⚙️ System Fields
    status: {
      type: String,
      enum: ["active", "suspended", "graduated", "transferred"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
