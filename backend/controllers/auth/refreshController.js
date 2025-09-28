const User = require("../../models/User");
const jwt = require("jsonwebtoken");

const handleTokenRefresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401); // No refresh token

  const oldRefreshToken = cookies.jwt;

  try {
    // Find user with this refresh token
    const user = await User.findOne({ "refreshTokens.token": oldRefreshToken });
    if (!user) return res.sendStatus(403); // Token not in DB

    // Verify the old refresh token
    const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_SECRET);
    if (!decoded) return res.sendStatus(403);
    // ✅ Generate new tokens
    const newAccessToken = jwt.sign(
      {
        email: user.email,
        role: user.role,
        school: user.school,
        userId: user._id,
      },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Replace old refresh token with the new one
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== oldRefreshToken
    );
    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
      deviceInfo: req.headers["user-agent"] || "unknown device",
    });

    await user.save();

    const populatedUser = await User.findById(user._id).populate("school");
    
    // ✅ Send back tokens
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      sameSite: process.env.SAMESITE_CONFIG,
      secure: process.env.NODE_ENV !== "dev",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });

    // refreshToken.js

    res.json({
      accessToken: newAccessToken,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        school: {
          id: populatedUser.school._id,
          name: populatedUser.school.name,
          paidPesapal: populatedUser.school.paidPesapal,
          isPilotSchool: populatedUser.school.isPilotSchool,
          isFreeTrial: populatedUser.school.isFreeTrial,
        },
        isClassTeacher: populatedUser.isClassTeacher,
      },
    });
  } catch (err) {
    console.error(err);
    return res.sendStatus(403);
  }
};

module.exports = handleTokenRefresh;
