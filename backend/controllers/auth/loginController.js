const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const handleLogin = async (req, res) => {
  const deviceInfo = req.headers["user-agent"] || "unknown device";

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(404).json({ msg: "User Does Not Exist" });
  }
  const foundUser = await User.findOne({ email });
  if (!foundUser) return res.status(404).json({ msg: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

  const accessToken = jwt.sign(
    { email, role: foundUser.role },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const MAX_DEVICES = 5; // max number of active sessions per user

  // Add a new refresh token
  foundUser.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    deviceInfo,
  });

  // Enforce limit
  if (foundUser.refreshTokens.length > MAX_DEVICES) {
    // Sort by creation date and remove the oldest
    foundUser.refreshTokens.sort((a, b) => a.createdAt - b.createdAt);
    foundUser.refreshTokens = foundUser.refreshTokens.slice(-MAX_DEVICES);
  }

  await foundUser.save();

  res
    .cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV !== "dev",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      accessToken: accessToken,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        school: foundUser.school,
      },
    });
};

module.exports = handleLogin;
