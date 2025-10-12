// controllers/proofController.js
const PaymentProof = require("../../models/PaymentProof");
const Student = require("../../models/Student");
const FeeTransaction = require("../../models/FeeTransaction");
const StudentCredit = require("../../models/StudentCredit");
const School = require("../../models/School");
const pushSubscription = require("../../models/pushSubscription");
const webpush = require("web-push");


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
    const subscriptions = await pushSubscription.find({
      school: student.school,
    }).populate("user");

    const payload = {
      title: "New Payment Proof Submitted",
      body: `${student.firstName} ${student.lastName} - KSh ${amount}`,
      url: "/dashboard/fees/add",
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

async function recordTransactionInternal(req) {
  const { studentId, academicYear, term, amount, type, method, note } = req.body;
  const userId = req.user.userId;

  let amt = Number(amount);
  if (type === "payment") amt = Math.abs(amt);
  else if (type === "adjustment") amt = Number(amount);
  if (isNaN(amt)) throw new Error("Amount must be a valid number");

  const student = await Student.findById(studentId).populate("school");
  if (!student) throw new Error("Student not found");

  const expected = await student.getExpectedFee(academicYear, term);
  const currentPaid = await FeeTransaction.aggregate([
    { $match: { student: student._id, academicYear, term } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const alreadyPaid = currentPaid[0]?.total || 0;

  let toApply = Math.min(amt, Math.max(0, expected - alreadyPaid));
  let excess = amt - toApply;

  const txn = await FeeTransaction.create({
    student: studentId,
    school: student.school._id,
    academicYear,
    term,
    amount: toApply,
    type,
    method,
    note,
    handledBy: userId,
  });

  // Carryover excess
  const terms = ["Term 1", "Term 2", "Term 3"];
  let currentYear = academicYear;
  let nextTermIndex = terms.indexOf(term) + 1;

  while (excess > 0) {
    if (nextTermIndex >= terms.length) {
      const [startY, endY] = currentYear.split("/").map(Number);
      const nextYear = `${startY + 1}/${endY + 1}`;
      await FeeTransaction.create({
        student: student._id,
        school: student.school._id,
        academicYear: nextYear,
        term: "Term 1",
        amount: excess,
        type,
        method,
        note: `Carryover credit from ${academicYear} ${term}`,
        handledBy: userId,
      });
      await StudentCredit.create({
        student: student._id,
        school: student.school._id,
        academicYear: nextYear,
        term: "Term 1",
        amount: excess,
        source: `Overpayment from ${academicYear} ${term}`,
        createdBy: userId,
      });
      break;
    }

    const nextTerm = terms[nextTermIndex];
    const nextExpected = await student.getExpectedFee(currentYear, nextTerm);
    if (!nextExpected || nextExpected <= 0) break;

    const nextPaid = await FeeTransaction.aggregate([
      { $match: { student: student._id, academicYear: currentYear, term: nextTerm } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const nextAlreadyPaid = nextPaid[0]?.total || 0;
    const nextRoom = Math.max(0, nextExpected - nextAlreadyPaid);

    const applied = Math.min(excess, nextRoom);
    excess -= applied;

    if (applied > 0) {
      await FeeTransaction.create({
        student: student._id,
        school: student.school._id,
        academicYear: currentYear,
        term: nextTerm,
        amount: applied,
        type,
        method,
        note: `Carryover from ${academicYear} ${term}`,
        handledBy: userId,
      });
    }
    nextTermIndex++;
  }

  return txn;
}


exports.reviewProof = async (req, res) => {
  try {
    const { proofId, action } = req.params;

    const proof = await PaymentProof.findById(proofId)
      .populate("studentId")
      .populate("parentId");
    if (!proof) return res.status(404).json({ message: "Proof not found" });
    if (proof.status !== "pending")
      return res.status(400).json({ message: "Proof already reviewed" });

    const student = proof.studentId;
    const parent = proof.parentId;
    const io = req.app.get("io");

    let message, status, payload;

    if (action === "reject") {
      proof.status = "rejected";
      await proof.save();

      message = `Your payment proof for ${student.firstName} ${student.lastName} was rejected.`;
      status = "rejected";

      // Notify parent via Socket.IO
      io.to(parent._id.toString()).emit("proofReviewed", {
        proofId: proof._id,
        studentId: student._id,
        status,
        message,
      });

      // Push notification for offline parent
      const subscriptions = await pushSubscription.find({ user: parent._id });
      payload = {
        title: "Payment Proof Rejected",
        body: `${student.firstName} ${student.lastName} — proof was rejected. Please review and resubmit.`,
        url: "/dashboard/fees/my-proofs",
      };
      subscriptions.forEach((sub) =>
        webpush.sendNotification(sub.subscription, JSON.stringify(payload)).catch(console.error)
      );

      return res.json({ message: "Proof rejected", proof });
    }

    if (action === "confirm" || action === "approve") {
      // ✅ Use same logic as recordTransaction
      const school = await School.findById(student.school).lean();
      const academicYear = school?.currentAcademicYear || "2025/2026";
      const term = school?.currentTerm || "Term 1";

      // Build a fake req.body to reuse recordTransaction logic
      const fakeReq = {
        body: {
          studentId: student._id,
          academicYear,
          term,
          amount: proof.amount,
          type: "payment",
          method: proof.method,
          note: `Confirmed via proof txn ${proof.txnCode}`,
        },
        user: req.user,
      };

      // Call recordTransaction logic internally
      // Extracted to a helper function for reuse
      const txn = await recordTransactionInternal(fakeReq);

      proof.status = "confirmed";
      await proof.save();

      message = `Your payment proof for ${student.firstName} ${student.lastName} was confirmed!`;
      status = "confirmed";

      // Notify parent via Socket.IO
      io.to(parent._id.toString()).emit("proofReviewed", {
        proofId: proof._id,
        studentId: student._id,
        status,
        message,
      });

      // Push notification for offline parent
      const subscriptions = await pushSubscription.find({ user: parent._id });
      payload = {
        title: "Payment Proof Confirmed",
        body: `${student.firstName} ${student.lastName} — KSh ${proof.amount} confirmed.`,
        url: "/dashboard/fees/my-proofs",
      };
      subscriptions.forEach((sub) =>
        webpush.sendNotification(sub.subscription, JSON.stringify(payload)).catch(console.error)
      );

      return res.json({
        message: "Proof confirmed, payment recorded",
        proof,
        feeTxn: txn,
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
