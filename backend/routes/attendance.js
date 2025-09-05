const express = require("express");

const authorize = require("../middleware/authorize");
const verifyJWT = require("../middleware/verifyJWT");
const controller = require('../controllers/attendance/attendanceController')

const router = express.Router();
router.post("/", verifyJWT, controller.saveAttendance);
router.get("/", verifyJWT, controller.getAttendanceByDate);
router.get("/range", verifyJWT, controller.getStatsByRange);
router.get("/absentees", verifyJWT, controller.getAbsenteeListRange);


module.exports = router;
