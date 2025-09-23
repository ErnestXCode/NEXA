const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");

const {
  addFee,
  getStudentFees,
  getOutstandingFees,
  getAllFees,
  getTotalOutstanding,
  deleteFee,
  editFee,
  getStudentOutstanding,
} = require("../controllers/fee/feeController");

const { getLedger } = require("../controllers/fee/ledgerController");
const { addFeesBulk } = require("../controllers/fee/bulkController");

// 📌 Proof controller
const {
  submitProof,
  reviewProof,
  getPendingProofs,
  getMyProofs,
} = require("../controllers/fee/proofController");

const router = express.Router();

/* ---------------- FEES ---------------- */
router.post("/", verifyJWT, authorize(["bursar", "admin"]), addFee);
router.post("/bulk", verifyJWT, authorize(["bursar", "admin"]), addFeesBulk);

router.get("/", verifyJWT, authorize(["bursar", "admin"]), getAllFees);
router.get(
  "/outstanding",
  verifyJWT,
  authorize(["admin", "teacher", "bursar"]),
  getOutstandingFees
);
router.get("/outstanding/:studentId", verifyJWT, getStudentOutstanding);

router.get(
  "/total-outstanding",
  verifyJWT,
  authorize(["admin", "teacher", "bursar"]),
  getTotalOutstanding
);
router.get(
  "/ledger/:studentId",
  verifyJWT,
  authorize(["superadmin", "admin", "bursar"]),
  getLedger
);

router.get(
  "/student/:studentId",
  verifyJWT,
  authorize(["superadmin", "admin", "bursar"]),
  getStudentFees
);

/* ---------------- PROOFS ---------------- */

// Parent submits a proof
router.post("/proofs", verifyJWT, authorize(["parent"]), submitProof);

// Parent views own proofs
router.get("/proofs/my", verifyJWT, authorize(["parent"]), getMyProofs);

// Admin/bursar views all pending proofs
router.get(
  "/proofs/pending",
  verifyJWT,
  authorize(["admin", "bursar"]),
  getPendingProofs
);

// Admin/bursar reviews a proof (confirm/reject)
router.patch(
  "/proofs/:proofId/:action",
  verifyJWT,
  authorize(["admin", "bursar"]),
  reviewProof
);

router.patch("/:feeId", verifyJWT, authorize(["bursar", "admin"]), editFee);
router.delete("/:feeId", verifyJWT, authorize(["bursar", "admin"]), deleteFee);

module.exports = router;
