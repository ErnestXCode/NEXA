const User = require("../../models/User");
const jwt = require("jsonwebtoken");

const handleTokenRefresh = async (req, res) => {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) return res.sendStatus(401); // no cookie

  try {
    // verify token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // find user
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.sendStatus(403);

    // check if this refreshToken exists in their array
    const tokenExists = user.refreshTokens.some(
      (t) => t.token === refreshToken
    );
    if (!tokenExists) return res.sendStatus(403); // invalid token

    // generate new access token
    const accessToken = jwt.sign(
      { email: user.email, role: user.role },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (err) {
    return res.sendStatus(403); // expired or invalid
  }
};

module.exports = handleTokenRefresh;
