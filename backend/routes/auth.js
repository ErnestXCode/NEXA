const express = require("express");
const handleRegister = require("../controllers/auth/registerController");
const handleLogin = require("../controllers/auth/loginController");
const handleTokenRefresh = require("../controllers/auth/refreshController");
const verifyJWT = require("../middleware/verifyJWT");
const handleLogout = require("../controllers/auth/logoutController");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/refresh", handleTokenRefresh);
router.post("/logout", verifyJWT, handleLogout);

router.post('/registerpersonel', verifyJWT, authorize(['admin', 'superadmin']), handleRegister)

module.exports = router;
