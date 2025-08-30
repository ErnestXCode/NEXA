const express = require("express");
const {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
} = require("../controllers/attendance/attendanceController");
const authorize = require("../middleware/authorize");
const verifyJWT = require("../middleware/verifyJWT");
const router = express.Router();

// Mark attendance (Teacher/Admin)
router.post("/", verifyJWT, authorize(["teacher", "admin"]), markAttendance);

// Get attendance for a student
router.get(
  "/student/:studentId",
  verifyJWT,
  authorize(["superadmin", "admin", "teacher"], "bursar"),
  getStudentAttendance
);

// Get attendance by class
router.get(
  "/class",
  verifyJWT,
  authorize(["superadmin", "admin", "teacher"]),
  getClassAttendance
);

module.exports = router;
