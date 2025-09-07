const Attendance = require("../../models/Attendance");
const Student = require("../../models/Student");
const User = require("../../models/User");
const notificationService = require("../../services/notificationService");

// --- Save attendance ---
exports.saveAttendance = async (req, res) => {
  try {
    const { classLevel, date, records, notifyParents } = req.body;
    const requester = await User.findOne({ email: req.user.email });
    const markedBy = requester._id;

    let attendanceClassLevel = classLevel;
    if (requester.role === "teacher" && requester.isClassTeacher) {
      attendanceClassLevel = requester.classLevel;
    } else if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // normalize

    const results = [];

    for (const record of records) {
      const { studentId, status, reason } = record;

      if (requester.role === "teacher" && requester.isClassTeacher) {
        const student = await Student.findById(studentId);
        if (!student || student.classLevel !== requester.classLevel) continue;
      }

      const doc = await Attendance.findOneAndUpdate(
        { student: studentId, date: attendanceDate },
        {
          student: studentId,
          classLevel: attendanceClassLevel,
          school: requester.school,
          date: attendanceDate,
          status,
          reason,
          markedBy,
        },
        { upsert: true, new: true }
      );
      results.push(doc);

      if (notifyParents && status === "absent") {
        const student = await Student.findById(studentId).populate("guardian");
        if (student?.guardian) {
          notificationService.notifyParent(student.guardian, student, attendanceDate);
        }
      }
    }

    res.json({ msg: "Attendance saved", results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- Get attendance by date ---
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const requester = await User.findOne({ email: req.user.email });

    const filterDate = date ? new Date(date) : new Date();
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      date: { $gte: filterDate, $lte: nextDay },
      school: requester.school,
    });

    const studentFilter = {};
    if (requester.role === "teacher" && requester.isClassTeacher) {
      studentFilter.classLevel = requester.classLevel;
    }
    const students = await Student.find(studentFilter);

    const data = students.map((s) => {
      const record = attendanceRecords.find(
        (r) => r.student.toString() === s._id.toString()
      );
      return {
        ...s.toObject(),
        attendance: record
          ? { status: record.status, reason: record.reason }
          : { status: "present", reason: "" },
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- Get stats by range ---
exports.getStatsByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const requester = await User.findOne({ email: req.user.email });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filter = { date: { $gte: start, $lte: end }, school: requester.school };
    if (requester.role === "teacher" && requester.isClassTeacher) {
      filter.classLevel = requester.classLevel;
    }

    const records = await Attendance.aggregate([
  { $match: filter },
  {
    $group: {
      _id: { classLevel: "$classLevel", date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
      present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
      absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
      late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
      lastMarked: { $max: "$updatedAt" },
    },
  },
  {
    $group: {
      _id: "$_id.classLevel",
      present: { $sum: "$present" },
      absent: { $sum: "$absent" },
      late: { $sum: "$late" },
      markCount: { $sum: 1 }, // <-- distinct days counted
      lastMarked: { $max: "$lastMarked" },
    },
  },
  { $sort: { _id: 1 } },
]);


    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- Get chronic absentees ---
exports.getAbsenteeListRange = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const requester = await User.findOne({ email: req.user.email });

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const filter = {
      status: "absent",
      date: { $gte: since },
      school: requester.school,
    };
    if (requester.role === "teacher" && requester.isClassTeacher) {
      filter.classLevel = requester.classLevel;
    }

    const students = await Attendance.aggregate([
      { $match: filter },
      { $group: { _id: "$student", count: { $sum: 1 } } },
      { $match: { count: { $gt: 3 } } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          _id: 1,
          count: 1,
          firstName: "$studentInfo.firstName",
          lastName: "$studentInfo.lastName",
          classLevel: "$studentInfo.classLevel",
        },
      },
    ]);

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- Admin: get class-level stats for dashboard ---
// Get per-class stats for admin dashboard
exports.getClassStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const requester = await User.findOne({ email: req.user.email });

    if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filter = {
      date: { $gte: start, $lte: end },
      school: requester.school,
    };

    const records = await Attendance.aggregate([
      { $match: filter },
      // group by class + date first = one mark per class per day
      {
        $group: {
          _id: { classLevel: "$classLevel", date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          lastMarked: { $max: "$updatedAt" },
        },
      },
      // now roll up per class
      {
        $group: {
          _id: "$_id.classLevel",
          present: { $sum: "$present" },
          absent: { $sum: "$absent" },
          late: { $sum: "$late" },
          markCount: { $sum: 1 }, // only counts 1 per class per date
          lastMarked: { $max: "$lastMarked" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

