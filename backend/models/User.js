const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: function () {
        return this.role !== "superadmin";
      },
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

    // 🟢 New fields for teachers
    subjects: [{ type: String }], // e.g., ["Math", "English"]
    isClassTeacher: { type: Boolean, default: false },
    classLevel: { type: String }, // e.g., "Grade 5" if they are a class teacher

    refreshTokens: [{ token: String, createdAt: Date, deviceInfo: String }],
    // models/User.js (add these inside userSchema)
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
