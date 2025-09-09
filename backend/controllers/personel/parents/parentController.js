const mongoose = require("mongoose");
const User = require("../../../models/User");
const Student = require("../../../models/Student");
const Term = require("../../../models/Term");
const Fee = require("../../../models/Fee");
const School = require("../../../models/School");
const Attendance = require("../../../models/Attendance");
const Exam = require("../../../models/Exam");

// Get parent by ID
const getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await User.findById(id).populate({
      path: "children",
      select: "firstName lastName classLevel admissionNumber",
    });
    console.log(parent);

    if (!parent || parent.role !== "parent")
      return res.status(404).json({ msg: "Parent not found" });
    res.status(200).json(parent);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching parent", error: err.message });
  }
};

// Update parent
const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Parent not found" });
    res
      .status(200)
      .json({ msg: "Parent updated successfully", parent: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating parent", error: err.message });
  }
};

// Delete parent
const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "Parent not found" });
    res.status(200).json({ msg: "Parent deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting parent", error: err.message });
  }
};

// Get all parents (filtered by school if not superadmin)
const getAllParents = async (req, res) => {
  try {
    const requester = req.user;

    let query = { role: "parent" };

    console.log(requester.role);

    if (requester.role !== "admin" && requester.role !== "superadmin") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (requester.role === "admin") {
      query.school = requester.school; // school-specific parents
    }

    // superadmin sees all parents
    const parents = await User.find(query).populate({
      path: "children",
      select: "firstName lastName classLevel admissionNumber",
    });
    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching parents", error: err.message });
  }
};

const getParentDashboard = async (req, res) => {
  try {
    const parent = await User.findOne({ email: req.user.email }).populate({
      path: "children",
      select:
        "firstName lastName classLevel stream admissionNumber school payments",
    });

    if (!parent || parent.role !== "parent") {
      return res.status(404).json({ msg: "Parent not found" });
    }

    const childrenData = await Promise.all(
      parent.children.map(async (child) => {
        const schoolDoc = await School.findById(child.school).lean();
        if (!schoolDoc) return child;

        // find current term
        const now = new Date();
        const currentTermDoc = await Term.findOne({
          school: child.school,
          startDate: { $lte: now },
          endDate: { $gte: now },
        });
        const currentTerm = currentTermDoc?.name || "Term 1";

        // Determine expected fee (priority: feeRules -> class feeExpectations -> school.feeExpectations)
        let expectations = [];

        // 1️⃣ FeeRules
        if (schoolDoc.feeRules?.length) {
          const classIdx = schoolDoc.classLevels.findIndex(
            (c) => c.name === child.classLevel
          );
          const matchedRules = schoolDoc.feeRules.filter((rule) => {
            const fromIdx = schoolDoc.classLevels.findIndex(
              (c) => c.name === rule.fromClass
            );
            const toIdx = schoolDoc.classLevels.findIndex(
              (c) => c.name === rule.toClass
            );
            if (classIdx === -1 || fromIdx === -1 || toIdx === -1) return false;
            const min = Math.min(fromIdx, toIdx);
            const max = Math.max(fromIdx, toIdx);
            return (
              classIdx >= min && classIdx <= max && rule.term === currentTerm
            );
          });
          if (matchedRules.length) expectations = matchedRules;
        }

        // 2️⃣ Class-level feeExpectations
        if (!expectations.length) {
          const classDef = schoolDoc.classLevels.find(
            (c) => c.name === child.classLevel
          );
          if (classDef?.feeExpectations?.length) {
            expectations = classDef.feeExpectations.filter(
              (f) => f.term === currentTerm
            );
          }
        }

        // 3️⃣ School-level fallback
        if (!expectations.length) {
          expectations = schoolDoc.feeExpectations.filter(
            (f) => f.term === currentTerm
          );
        }

        const expectedFee = expectations[0]?.amount || 0;

        // sum payments and adjustments for the current term
        const payments = (child.payments || [])
          .filter((p) => p.term === currentTerm && p.category === "payment")
          .reduce((sum, p) => sum + p.amount, 0);

        const adjustments = (child.payments || [])
          .filter((p) => p.term === currentTerm && p.category === "adjustment")
          .reduce((sum, p) => sum + p.amount, 0);

        const outstanding = expectedFee - payments + adjustments;

        return {
          ...child.toObject(),
          currentTerm,
          feesSummary: {
            expected: expectedFee,
            paid: payments,
            adjustments,
            outstanding,
          },
        };
      })
    );

    res.status(200).json({ parent: parent._id, children: childrenData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Error fetching dashboard", error: err.message });
  }
};

// const getStudentAttendanceSummary = async (req, res) => {
//   try {
//     const parent = await User.findOne({ email: req.user.email }).populate("children");
//     if (!parent || parent.role !== "parent") {
//       return res.status(404).json({ msg: "Parent not found" });
//     }

//     const { studentId } = req.query;
//     const student = parent.children.find(c => c._id.toString() === studentId);
//     if (!student) {
//       return res.status(404).json({ msg: "Student not found" });
//     }

//     // Normalize date to start of day for accurate counting
//     const records = await Attendance.aggregate([
//       { $match: { student: student._id } },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // one per day
//           status: { $first: "$status" }, // only one record per day should exist due to saveAttendance
//         },
//       },
//     ]);

//     const total = records.length;
//     const present = records.filter(r => r.status === "present").length;
//     const absent = records.filter(r => r.status === "absent").length;
//     const late = records.filter(r => r.status === "late").length;

//     console.log('absent', records)

//     const summary = {
//       total,
//       present,
//       absent,
//       late,
//       presentPct: total ? ((present / total) * 100).toFixed(1) : 0,
//       absentPct: total ? ((absent / total) * 100).toFixed(1) : 0,
//       latePct: total ? ((late / total) * 100).toFixed(1) : 0,
//     };

//     res.json(summary);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// };

const getStudentAttendanceSummary = async (req, res) => {
  try {
    const parent = await User.findOne({ email: req.user.email }).populate(
      "children"
    );
    if (!parent || parent.role !== "parent") {
      return res.status(404).json({ msg: "Parent not found" });
    }

    const { studentId } = req.query;
    const student = parent.children.find((c) => c._id.toString() === studentId);
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // ensure ObjectId
    const studentObjectId = new mongoose.Types.ObjectId(student._id);

    // count absents
    const absentCount = await Attendance.countDocuments({
      student: studentObjectId,
      status: "absent",
    });
    const presentCount = await Attendance.countDocuments({
      student: studentObjectId,
      status: "present",
    });

    // count late
    const lateCount = await Attendance.countDocuments({
      student: studentObjectId,
      status: "late",
    });

    res.json({
      present: presentCount,
      absent: absentCount,
      late: lateCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const getChildrenExams = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId)
      return res.status(400).json({ msg: "studentId is required" });

    // Fetch parent and populate children
    const parent = await User.findOne({ email: req.user.email }).populate(
      "children"
    );
    if (!parent || parent.role !== "parent")
      return res.status(404).json({ msg: "Parent not found" });

    // Find the child in parent's children array
    const child = parent.children.find((c) => c._id.toString() === studentId);
    if (!child)
      return res.status(404).json({ msg: "Child not found for this parent" });

    // Map exams for this child only
    const examsWithResults = (child.examResults || []).map((er) => ({
      examId: er.exam,
      examName: er.examName || "Exam", // fallback if name not stored
      term: er.term,
      date: er.date,
      subjects: er.subjects || [],
      total: er.total || 0,
      average: er.average || 0,
      grade: er.grade || "N/A",
      remark: er.remark || "",
    }));

    res.status(200).json({
      studentId: child._id,
      studentName: `${child.firstName} ${child.lastName}`,
      results: examsWithResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


module.exports = {
  getParentById,
  getParentDashboard,
  updateParent,
  deleteParent,
  getStudentAttendanceSummary,
  getChildrenExams,
  getAllParents,
};
