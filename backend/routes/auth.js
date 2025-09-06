const express = require("express");
const handleRegister = require("../controllers/auth/registerController");
const handleLogin = require("../controllers/auth/loginController");
const handleTokenRefresh = require("../controllers/auth/refreshController");
const verifyJWT = require("../middleware/verifyJWT");
const handleLogout = require("../controllers/auth/logoutController");
const authorize = require("../middleware/authorize");
const handleBulkRegister = require("../controllers/auth/bulkRegisterController");
const { bulkCreateParents } = require("../controllers/personel/parents/bulkParentController");

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/refresh", handleTokenRefresh);
router.post("/logout", verifyJWT, handleLogout);

router.post(
  "/registerpersonel",
  verifyJWT,
  authorize(["admin", "superadmin"]),
  handleRegister
);
router.post(
  "/registerpersonel/bulk",
  verifyJWT,
  authorize(["admin", "superadmin"]),
  handleBulkRegister
);
router.post(
  "/registerparent/bulk",
  verifyJWT,
  bulkCreateParents
);

module.exports = router;
