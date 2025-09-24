// controllers/proofController.js
const PaymentProof = require("../../models/PaymentProof");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Fee = require("../../models/Fee");

// ---------------------
// Parent submits proof
// ---------------------
exports.submitProof = async (req, res) => {
  try {
    const { studentId, amount, method, txnCode } = req.body;
    const parentId = req.user.userId; // assume auth middleware attaches user

    // Verify student belongs to parent
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (String(student.guardian) !== String(parentId)) {
      return res.status(403).json({ message: "Not authorized for this student" });
    }

    const proof = new PaymentProof({
      studentId,
      parentId,
      amount,
      method,
      txnCode,
    });
    await proof.save();

    res.status(201).json({ message: "Proof submitted successfully", proof });
  } catch (err) {
    console.error("submitProof error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------
// Admin confirms/rejects
// ---------------------
exports.reviewProof = async (req, res) => {
  try {
    const { proofId, action } = req.params;
    const academicYear = '2025/2026'
    const term = 'Term 1'
    // action: "confirm" or "reject"

    const proof = await PaymentProof.findById(proofId).populate("studentId");
    if (!proof) return res.status(404).json({ message: "Proof not found" });

    if (proof.status !== "pending") {
      return res.status(400).json({ message: "Proof already reviewed" });
    }

    if (action === "reject") {
      proof.status = "rejected";
      await proof.save();
      return res.json({ message: "Proof rejected", proof });
    }

    if (action === "approve") {
  const student = await Student.findById(proof.studentId._id);

  // Record official payment in Fee collection
  const fee = await Fee.create({
    student: student._id,
    term,
    academicYear,
    classLevel: student.classLevel,
    amount: proof.amount,
    type: "payment",
    method: proof.method,
    note: `Confirmed via proof txn ${proof.txnCode}`,
    handledBy: req.user.userId, // admin/bursar ID
    school: student.school,
  });

  // Also push to student.payments for quick lookup
  student.payments.push({
    academicYear,
    term,
    amount: proof.amount,
    category: "payment",
    type: proof.method,
    note: `Confirmed via proof txn ${proof.txnCode}`,
  });

  // Update term totals
  if (term === "Term 1") student.amtPaidTerm1 += proof.amount;
  if (term === "Term 2") student.amtPaidTerm2 += proof.amount;
  if (term === "Term 3") student.amtPaidTerm3 += proof.amount;

  await student.save();

  proof.status = "confirmed";
  await proof.save();

  return res.json({
    message: "Proof confirmed, payment recorded in fees",
    proof,
    fee,
  });
}


    res.status(400).json({ message: "Invalid action" });
  } catch (err) {
    console.error("reviewProof error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------
// Admin/bursar fetch pending proofs
// ---------------------
exports.getPendingProofs = async (req, res) => {
  try {
    const proofs = await PaymentProof.find({ status: "pending" })
      .populate("studentId", "firstName lastName classLevel")
      .populate("parentId", "name phoneNumber");

    res.json(proofs);
  } catch (err) {
    console.error("getPendingProofs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------
// Parent fetch own proofs
// ---------------------
exports.getMyProofs = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const proofs = await PaymentProof.find({ parentId })
      .populate("studentId", "firstName lastName classLevel");

    res.json(proofs);
  } catch (err) {
    console.error("getMyProofs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
