const User = require("../../models/User");

const handleLogout = async (req, res) => {
  // logout for current device
   const refreshToken = req.cookies.jwt;
  if (!refreshToken) return res.sendStatus(204); // No content

  const { email } = req.user;
  await User.updateOne(
    { email },
    { $pull: { refreshTokens: { token: refreshToken } } }
  );

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV !== "dev",
  });
  res.json({ message: "Logged out successfully" });
};

module.exports = handleLogout;
