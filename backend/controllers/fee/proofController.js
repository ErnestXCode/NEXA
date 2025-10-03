// controllers/proofController.js
const PaymentProof = require("../../models/PaymentProof");
const Student = require("../../models/Student");
const FeeTransaction = require("../../models/FeeTransaction");
const School = require("../../models/School");

// ---------------------
// Parent submits proof
// ---------------------
// exports.submitProof = async (req, res) => {
//   try {
//     const { studentId, amount, method, txnCode } = req.body;
//     const parentId = req.user.userId;

//     // Verify student belongs to parent
//     const student = await Student.findById(studentId);
//     if (!student) return res.status(404).json({ message: "Student not found" });
//     if (String(student.guardian) !== String(parentId)) {
//       return res.status(403).json({ message: "Not authorized for this student" });
//     }

//     // Optional: auto-fill academicYear and term from school
//     const school = await School.findById(student.school).lean();
//     const academicYear = school?.currentAcademicYear || "2025/2026";
//     const term = school?.currentTerm || "Term 1";

//     const proof = new PaymentProof({
//       studentId,
//       parentId,
//       amount,
//       method,
//       txnCode,
//       academicYear,
//       term,
//     });

//     await proof.save();

//     res.status(201).json({ message: "Proof submitted successfully", proof });
//   } catch (err) {
//     console.error("submitProof error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.submitProof = async (req, res) => {
  try {
    const { studentId, amount, method, txnCode } = req.body;
    const parentId = req.user.userId;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (String(student.guardian) !== String(parentId)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this student" });
    }

    const school = await School.findById(student.school).lean();
    const academicYear = school?.currentAcademicYear || "2025/2026";
    const term = school?.currentTerm || "Term 1";

    const proof = new PaymentProof({
      studentId,
      parentId,
      amount,
      method,
      txnCode,
      academicYear,
      term,
    });

    await proof.save();

    // 🔹 REAL-TIME NOTIFICATION (Socket.IO) to admins/bursars
    const io = req.app.get("io");
    io.to(student.school.toString()).emit("newProof", {
      proofId: proof._id,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      amount,
      method,
      parentId,
      timestamp: new Date(),
    });

    // 🔹 PUSH NOTIFICATIONS for offline admins/bursars
    const subscriptions = await PushSubscription.find({
      school: student.school,
    }).populate("user");

    const payload = {
      title: "New Payment Proof Submitted",
      body: `${student.firstName} ${student.lastName} - KSh ${amount}`,
      url: "/dashboard/proofs",
    };

    subscriptions.forEach((sub) => {
      // Only notify admin/bursar
      if (!["admin", "bursar"].includes(sub.user.role)) return;

      webpush
        .sendNotification(sub.subscription, JSON.stringify(payload))
        .catch((err) => console.error("Push failed:", err));
    });

    res.status(201).json({ message: "Proof submitted successfully" });
  } catch (err) {
    console.error("submitProof error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------
// Admin confirms/rejects proof
// ---------------------
exports.reviewProof = async (req, res) => {
  try {
    const { proofId, action } = req.params;

    const proof = await PaymentProof.findById(proofId).populate("studentId");
    if (!proof) return res.status(404).json({ message: "Proof not found" });
    if (proof.status !== "pending")
      return res.status(400).json({ message: "Proof already reviewed" });

    if (action === "reject") {
      proof.status = "rejected";
      await proof.save();
      return res.json({ message: "Proof rejected", proof });
    }

    if (action === "confirm" || action === "approve") {
      const student = await Student.findById(proof.studentId._id);

      // Optional: auto-fill academicYear and term from school
      const school = await School.findById(student.school).lean();
      const academicYear = school?.currentAcademicYear || "2025/2026";
      const term = school?.currentTerm || "Term 1";

      // Record official payment in FeeTransaction
      const feeTxn = await FeeTransaction.create({
        student: student._id,
        school: student.school,
        academicYear,
        term,
        amount: proof.amount,
        type: "payment",
        method: proof.method,
        note: `Confirmed via proof txn ${proof.txnCode}`,
        handledBy: req.user.userId, // admin/bursar ID
      });

      proof.status = "confirmed";
      await proof.save();

      return res.json({
        message: "Proof confirmed, payment recorded",
        proof,
        feeTxn,
      });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (err) {
    console.error("reviewProof error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------
// Admin fetches pending proofs
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
// Parent fetches own proofs
// ---------------------
exports.getMyProofs = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const proofs = await PaymentProof.find({ parentId }).populate(
      "studentId",
      "firstName lastName classLevel"
    );

    res.json(proofs);
  } catch (err) {
    console.error("getMyProofs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
