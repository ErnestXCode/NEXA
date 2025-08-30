const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const { addFee, getStudentFees } = require("../controllers/fee/feeController");
const router = express.Router();

// Add payment / adjust fee (Bursar/Admin)
router.post("/", verifyJWT, authorize(["bursar", "admin"]), addFee);

// Get fee history for a student
router.get(
  "/student/:studentId",
  verifyJWT,
  authorize(["superadmin", "admin", "bursar"]),
  getStudentFees
);

module.exports = router;
