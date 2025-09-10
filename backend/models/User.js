const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const School = require("./School"); // import your School model

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["teacher", "bursar", "admin", "superadmin", "parent"],
      required: true,
    },
    password: { type: String, required: true },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: function () {
        return this.role !== "superadmin";
      },
    },

    // 🟢 New fields for teachers
    subjects: [{ type: String }], // e.g., ["Math", "English"]
    isClassTeacher: { type: Boolean, default: false },
    classLevel: { type: String }, // e.g., "Grade 5" if they are a class teacher

    refreshTokens: [{ token: String, createdAt: Date, deviceInfo: String }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// ---------------- HASH PASSWORD ----------------
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// ---------------- VALIDATION HOOK FOR TEACHERS ----------------
userSchema.pre("save", async function (next) {
  try {
    if (this.role === "teacher") {
      if (!this.school) throw new Error("Teacher must belong to a school");

      // 1️⃣ Validate classLevel if teacher is a class teacher
      if (this.isClassTeacher && this.classLevel) {
        const classValidation = await School.validateClassLevel(this.school, this.classLevel);
        if (!classValidation.valid) throw new Error(`Invalid classLevel: ${classValidation.reason}`);
      }

      // // 2️⃣ Validate subjects (if any)
      // for (let subj of this.subjects || []) {
      //   const subjectValidation = await School.validateSubject(this.school, subj);
      //   if (!subjectValidation.valid) throw new Error(`Invalid subject "${subj}": ${subjectValidation.reason}`);
      // }
    }

    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
