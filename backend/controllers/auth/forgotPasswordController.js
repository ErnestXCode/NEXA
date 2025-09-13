const crypto = require("crypto");
const User = require("../../models/User");

const forgotPasswordInternal = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    await user.save();

    // Instead of sending email, return token to the client
    // The frontend should display this token securely for the user to copy
    res.status(200).json({
      msg: "Password reset token generated",
      token, // ⚠️ only for internal/private apps, not production over public APIs
      expiresIn: 3600
    });
  } catch (err) {
    console.error('err', err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};




const resetPasswordInternal = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ msg: "Token and new password are required" });

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.password = password; // assign new password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save(); // pre-save hook will hash it

    res.status(200).json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



module.exports = {forgotPasswordInternal, resetPasswordInternal}