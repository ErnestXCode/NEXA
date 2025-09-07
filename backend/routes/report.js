const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const {
  downloadStudentReport,
  downloadClassReports,
} = require("../controllers/exam/reportController");

const router = express.Router();

// Single student
router.get(
  "/student/:examId/:studentId",
  verifyJWT,
  authorize(["teacher", "admin"]),
  downloadStudentReport
);

// Whole class zipped
router.get(
  "/class/:examId/:classLevel",
  verifyJWT,
  authorize(["teacher", "admin"]),
  downloadClassReports
);

module.exports = router;
