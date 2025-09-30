// routes/feeRoutes.js
const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");

const {
  recordTransaction,
  getStudentBalance,
  setFeeRules,
  getStudentTransactions,
  getSchoolSummary,
  getSchoolTermSummary,
  getClassTermSummary,
  getSchoolTermComparison,
  getClassSummary,
  getDebtors,
} = require("../controllers/fee/feeController");

const {
  submitProof,
  reviewProof,
  getPendingProofs,
  getMyProofs,
} = require("../controllers/fee/proofController");

const router = express.Router();

/* ---------------- FEES ---------------- */

// 💰 Record new payment/adjustment
router.post("/transactions", verifyJWT, recordTransaction);

// 📊 Get balances for a student
router.get("/students/:studentId/balance", verifyJWT, getStudentBalance);

// 🔍 Fetch student transaction history
router.get(
  "/students/:studentId/transactions",
  verifyJWT,
  getStudentTransactions
);

// 🏫 Update school fee rules
router.post("/schools/:schoolId/feerules", verifyJWT, setFeeRules);

// 🏫 Whole school summary
router.get("/schools/:schoolId/summary", verifyJWT, getSchoolSummary);

// 📚 Class-level breakdown
router.get("/schools/:schoolId/class-summary", verifyJWT, getClassSummary);

// 🚨 Debtors list
router.get("/schools/:schoolId/debtors", verifyJWT, getDebtors);

router.get(
  "/schools/:schoolId/term-summary",
  verifyJWT,
  getSchoolTermSummary
);

router.get(
  "/schools/:schoolId/class-term-summary",
  verifyJWT,
  getClassTermSummary
);

router.get(
  "/schools/:schoolId/term-comparison",
  verifyJWT,
  getSchoolTermComparison
);


/* ---------------- PROOFS ---------------- */

// Parent submits proof of payment
router.post("/proofs", verifyJWT, authorize(["parent"]), submitProof);

// Parent fetches their own proofs
router.get("/proofs/my", verifyJWT, authorize(["parent"]), getMyProofs);

// Admin/Bursar fetch pending proofs
router.get(
  "/proofs/pending",
  verifyJWT,
  authorize(["admin", "bursar"]),
  getPendingProofs
);

// Admin/Bursar review (approve/reject) proof
router.patch(
  "/proofs/:proofId/:action",
  verifyJWT,
  authorize(["admin", "bursar"]),
  reviewProof
);

module.exports = router;
