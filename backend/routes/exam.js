const express = require("express");
const authorize = require("../middleware/authorize");
const {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  recordResult,
} = require("../controllers/exam/examController");
const verifyJWT = require("../middleware/verifyJWT");
const router = express.Router();

// Admin & Teacher can manage exams
router.post("/", verifyJWT, authorize(["admin", "teacher"]), createExam);
router.get(
  "/",
  verifyJWT,
  authorize(["superadmin", "admin", "teacher"]),
  getAllExams
);
router.get(
  "/:id",
  verifyJWT,
  authorize(["superadmin", "admin", "teacher"])
);
// router.put("/:id", verifyJWT, authorize(["admin", "teacher"]), updateExam);
// router.delete("/:id", verifyJWT, authorize(["admin", "teacher"]), deleteExam);

// Record student results
router.post(
  "/record-result",
  verifyJWT,
  authorize(["teacher", "admin"]),
  recordResult
);

router.post(
  "/report-card/:studentId/:term",
  verifyJWT,
  authorize(["teacher", "admin"]),
  recordResult
);

module.exports = router;
