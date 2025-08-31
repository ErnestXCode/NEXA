const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const { addFee, getStudentFees } = require("../controllers/fee/feeController");
const getOutstandingFees = require("../controllers/fee/outstandingFeeController");
const {
  sendFeeStatement,
} = require("../controllers/fee/feeStatementController");
const router = express.Router();

// Add payment / adjust fee (Bursar/Admin)
router.post("/", verifyJWT, authorize(["bursar", "admin"]), addFee);

router.get(
  "/outstanding",
  verifyJWT,
  authorize(["admin", "teacher"]),
  getOutstandingFees
);
router.post("/send-fee-statement", verifyJWT, sendFeeStatement);

// Get fee history for a student
router.get(
  "/student/:studentId",
  verifyJWT,
  authorize(["superadmin", "admin", "bursar"]),
  getStudentFees
);

module.exports = router;
