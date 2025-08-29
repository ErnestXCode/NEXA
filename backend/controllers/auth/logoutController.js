const User = require("../../models/User");

const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content

  const refreshToken = cookies.jwt;

  try {
    // Find the user with this token
    const user = await User.findOne({ "refreshTokens.token": refreshToken });
    if (user) {
      // Remove that refresh token
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => rt.token !== refreshToken
      );
      await user.save();
    }

    // Clear cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV !== "dev",
    });
    res.sendStatus(204); // Success, no content
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

module.exports = handleLogout;
