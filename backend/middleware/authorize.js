// middleware/authorize.js
const authorize = (allowedRoles) => (req, res, next) => {
  const { role } = req.user; // req.user comes from verifyJWT
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ msg: "Forbidden: insufficient rights" });
  }
  next();
};

module.exports = authorize;
