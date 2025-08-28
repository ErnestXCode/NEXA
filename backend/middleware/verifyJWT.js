// middleware/verifyJWT.js
const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Forbidden / Token expired" });

    req.user = decoded; // attach decoded payload (email, role, etc.)
    next();
  });
};

module.exports = verifyJWT;
