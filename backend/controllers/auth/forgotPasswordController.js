const crypto = require("crypto");
const User = require("../../models/User");
const brevo = require("../../utils/brevo");

const APP_URL = process.env.VITE_URL || "http://localhost:5173"; // React app

const forgotPasswordInternal = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${APP_URL}/reset-password/${rawToken}`;

    await brevo.sendTransacEmail({
      sender: { email: "enkaranu58@gmail.com", name: "Nexa" },
      to: [{ email: user.email }],
      subject: "Password Reset Request",
      htmlContent: `
        <p>Hello ${user.name || ""},</p>
        <p>Click below to reset your password (expires in 1 hour):</p>
        <p><a href="${resetLink}">Reset Password</a></p>
      `,
    });

    res.status(200).json({ msg: "Password reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


const resetPasswordInternal = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ msg: "Token and new password are required" });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.password = password; // hashed via pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


module.exports = { forgotPasswordInternal, resetPasswordInternal };
