const express = require("express");
const authorize = require("../middleware/authorize");
const {
  createExam,
  getAllExams,
  recordResult,
  getReportCard
} = require("../controllers/exam/examController");
const verifyJWT = require("../middleware/verifyJWT");
const router = express.Router();

router.post("/", verifyJWT, authorize(["admin", "teacher"]), createExam);
router.get("/", verifyJWT, authorize(["superadmin", "admin", "teacher"]), getAllExams);
router.post("/record-result", verifyJWT, authorize(["teacher", "admin"]), recordResult);
router.get("/report-card/:studentId/:term", verifyJWT, authorize(["teacher", "admin"]), getReportCard);

module.exports = router;
