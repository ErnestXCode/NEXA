const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const controller = require("../controllers/attendance/attendanceController");
const Attendance = require("../models/Attendance");
const checkSchoolPaid = require("../middleware/checkSchoolPaid");


const router = express.Router();



// Save attendance (teacher/admin)
router.post("/", verifyJWT, controller.saveAttendance);

// Get attendance for a specific date (teacher sees own class)
router.get("/", verifyJWT, controller.getAttendanceByDate);

router.get("/logs", verifyJWT, controller.getAllAttendanceLogs);

// Stats for a date range (teacher: own class, admin: all classes)
router.get("/range", verifyJWT, controller.getStatsByRange);

router.get("/details", verifyJWT, controller.getAttendanceDetails);

// Chronic absentees over last N days
router.get("/absentees", verifyJWT, controller.getAbsenteeListRange);

// Admin: stats per class for a date range
router.get("/class-stats", verifyJWT, controller.getClassStats);

router.patch("/:id", verifyJWT, async (req, res) => {
  const { reason } = req.body;

  console.log(req.params.id)
  try {
    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      { reason },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update reason" });
  }
});


module.exports = router;
