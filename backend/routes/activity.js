const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const getActivities = require("../controllers/activity/activity");
const router = express.Router();

router.get("/", verifyJWT, authorize(["admin", "teacher"]), getActivities);

module.exports = router;
