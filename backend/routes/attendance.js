const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const controller = require("../controllers/attendance/attendanceController");

const router = express.Router();

// Save attendance (teacher/admin)
router.post("/", verifyJWT, controller.saveAttendance);

// Get attendance for a specific date (teacher sees own class)
router.get("/", verifyJWT, controller.getAttendanceByDate);

// Stats for a date range (teacher: own class, admin: all classes)
router.get("/range", verifyJWT, controller.getStatsByRange);

// Chronic absentees over last N days
router.get("/absentees", verifyJWT, controller.getAbsenteeListRange);

// Admin: stats per class for a date range
router.get("/class-stats", verifyJWT, controller.getClassStats);

module.exports = router;
