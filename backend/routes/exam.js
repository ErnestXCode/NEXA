const express = require("express");
const authorize = require("../middleware/authorize");
const {
  createExam,
  getAllExams,
  recordResult,
  getResultsForExamClass
} = require("../controllers/exam/examController");
const verifyJWT = require("../middleware/verifyJWT");
const router = express.Router();

// Admin & Teacher can manage exams
// Create exam
router.post("/", verifyJWT, authorize(["admin"]), createExam);

// Get all exams
router.get("/", verifyJWT, authorize(["superadmin", "admin", "teacher"]), getAllExams);

// Record results (bulk upsert)
router.post("/results", verifyJWT, authorize(["teacher", "admin"]), recordResult);

// Fetch saved results for exam + class
router.get(
  "/results/:examId/:classLevel",
  verifyJWT,
  authorize(["teacher", "admin"]),
  getResultsForExamClass
);

module.exports = router;
