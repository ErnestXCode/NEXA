const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const {
  addFee,
  getStudentFees,
  getOutstandingFees,
  getAllFees,
  bulkUploadFees,
  bulkUploadStudentsWithFees
} = require("../controllers/fee/feeController");

const router = express.Router();

// Add payment / adjustment (Bursar/Admin)
router.post("/", verifyJWT, authorize(["bursar", "admin"]), addFee);

// Get all fees
router.get("/", verifyJWT, authorize(["bursar", "admin"]), getAllFees);

// Get total outstanding fees (dynamic)
router.get(
  "/outstanding",
  verifyJWT,
  authorize(["admin", "teacher", "bursar"]),
  getOutstandingFees
);

router.post(
  "/bulk-upload",
  verifyJWT,
  authorize(["admin", "bursar"]),
  bulkUploadFees
);

router.post(
  "/bulk-upload-with-fees",
  verifyJWT,
  authorize(["admin", "bursar"]),
  bulkUploadStudentsWithFees
);

// Get student fee history
router.get(
  "/student/:studentId",
  verifyJWT,
  authorize(["superadmin", "admin", "bursar"]),
  getStudentFees
);

module.exports = router;
