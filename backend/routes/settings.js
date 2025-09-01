const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const {
  getSettings,
  updateSettings,
} = require("../controllers/settings/settingsComtroller");
const router = express.Router();


router.get("/", verifyJWT, authorize(["admin"]), getSettings);
router.put("/", verifyJWT, authorize(["admin"]), updateSettings);

module.exports = router;
