const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["teacher", "bursar", "admin", "superadmin"], required: true },
  password: { type: String, required: true },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: function () {
      return this.role !== "superadmin"; // superadmin may not belong to a school
    },
  },
  refreshTokens: [{ token: String, createdAt: Date, deviceInfo: String }],
}, { timestamps: true });

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
