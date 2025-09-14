const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const {
  addFee,
  getStudentFees,
  getOutstandingFees,
  getAllFees,
  getTotalOutstanding
} = require("../controllers/fee/feeController");

const { getLedger } = require("../controllers/fee/ledgerController");
const { addFeesBulk } = require("../controllers/fee/bulkController");

const router = express.Router();

router.post("/", verifyJWT, authorize(["bursar", "admin"]), addFee);
router.post("/bulk", verifyJWT, authorize(["bursar", "admin"]), addFeesBulk);

router.get("/", verifyJWT, authorize(["bursar", "admin"]), getAllFees);
router.get("/outstanding", verifyJWT, authorize(["admin", "teacher", "bursar"]), getOutstandingFees);
router.get("/total-outstanding", verifyJWT, authorize(["admin", "teacher", "bursar"]), getTotalOutstanding);
router.get("/ledger/:studentId", verifyJWT, authorize(["superadmin", "admin", "bursar"]), getLedger);

router.get("/student/:studentId", verifyJWT, authorize(["superadmin", "admin", "bursar"]), getStudentFees);

module.exports = router;
