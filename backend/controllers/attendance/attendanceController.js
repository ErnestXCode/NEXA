const Attendance = require("../../models/Attendance");
const Student = require("../../models/Student");
const User = require("../../models/User");
const notificationService = require("../../services/notificationService");
const School = require("../../models/School");
const pushSubscription = require("../../models/pushSubscription");
const webpush = require('web-push')

// Helper to set current academic year if not provided
const getAcademicYear = (year) => year || School.currentAcademicYear();

// --- Save attendance ---



// --- Save attendance ---
exports.saveAttendance = async (req, res) => {
  try {
    const { classLevel, date, term, records, notifyParents, academicYear } = req.body;
    const requester = await User.findById(req.user.userId);
    const markedBy = requester._id;

    let attendanceClassLevel = classLevel;
    if (requester.role === "teacher" && requester.isClassTeacher) {
      attendanceClassLevel = requester.classLevel;
    } else if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const year = getAcademicYear(academicYear);

    const results = [];

    for (const record of records) {
      const { studentId, status, reason } = record;

      if (requester.role === "teacher" && requester.isClassTeacher) {
        const student = await Student.findById(studentId);
        if (!student || student.classLevel !== requester.classLevel) continue;
      }

      // Use $set to avoid duplicate key errors
      const doc = await Attendance.findOneAndUpdate(
        { student: studentId, date: attendanceDate, academicYear: year, term },
        {
          $set: {
            student: studentId,
            classLevel: attendanceClassLevel,
            school: requester.school,
            date: attendanceDate,
            term,
            status,
            reason,
            markedBy,
            academicYear: year,
          },
        },
        { upsert: true, new: true }
      );

      results.push(doc);

      if (["absent", "late"].includes(status)) {
        const student = await Student.findById(studentId)
          .populate("guardian", "name role");

        if (student?.guardian) {
          const subscriptions = await pushSubscription.find({
            user: student.guardian._id,
          });

          const payload = {
            title:
              status === "absent"
                ? "Attendance Alert: Absent"
                : "Attendance Alert: Late Arrival",
            body:
              status === "absent"
                ? `${student.firstName} ${student.lastName} was marked absent on ${attendanceDate.toDateString()}.`
                : `${student.firstName} ${student.lastName} arrived late on ${attendanceDate.toDateString()}.`,
            url: "/dashboard/parent/attendance",
          };

          subscriptions.forEach((sub) => {
            webpush
              .sendNotification(sub.subscription, JSON.stringify(payload))
              .catch((err) => console.error("Push failed:", err));
          });
        }
      }
    
    }

    res.json({ msg: "Attendance saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};


exports.getAllAttendanceLogs = async (req, res) => {
  try {
    const {
      date,
      academicYear,
      term,
      classLevel,
      status,
      search, // student name
      page = 1,
      limit = 50,
    } = req.query;

    const query = {
      school: req.user.school
    };

    if (date) query.date = new Date(date);
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    if (classLevel) query.classLevel = classLevel;
    if (status) query.status = status;

    let recordsQuery = Attendance.find(query)
      .populate("student", "firstName lastName classLevel")
      .populate("markedBy", "name")
      .populate("school", "name")
      .sort({ date: -1 });

    if (search) {
      recordsQuery = recordsQuery.where("student").populate({
        path: "student",
        match: { firstName: { $regex: search, $options: "i" } },
      });
    }

    const total = await Attendance.countDocuments(query);
    const records = await recordsQuery
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ total, page: Number(page), limit: Number(limit), records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch attendance logs" });
  }
};

// --- Get attendance by date ---
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date, academicYear, term } = req.query;
    const requester = await User.findById(req.user.userId);

    const filterDate = new Date(date);
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setHours(23, 59, 59, 999);

    const year = getAcademicYear(academicYear);

    const attendanceRecords = await Attendance.find({
      date: { $gte: filterDate, $lte: nextDay },
      academicYear: year,
      term,
      school: requester.school,
    });

    const studentFilter = {};
    if (requester.role === "teacher" && requester.isClassTeacher) {
      studentFilter.classLevel = requester.classLevel;
    }
    if (requester.role !== "superadmin") {
      studentFilter.school = requester.school;
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


// --- Get attendance details for recent days ---
// --- Get attendance details for recent days ---
exports.getAttendanceDetails = async (req, res) => {
  try {
    const { days = 7, academicYear, term } = req.query;
    const requester = await User.findById(req.user.userId);

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const year = getAcademicYear(academicYear);

    const filter = {
      status: { $in: ["absent", "late"] },
      date: { $gte: since },
      academicYear: year,
      school: requester.school,
    };

    // 🔹 include term in filter
    if (term) filter.term = term;

    if (requester.role === "teacher" && requester.isClassTeacher) {
      filter.classLevel = requester.classLevel;
    }

    const records = await Attendance.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          _id: 1,
          status: 1,
          reason: 1,
          date: 1,
          classLevel: "$studentInfo.classLevel",
          studentName: {
            $concat: [
              "$studentInfo.firstName",
              " ",
              "$studentInfo.middleName",
              " ",
              "$studentInfo.lastName",
            ],
          },
        },
      },
      { $sort: { date: -1 } },
    ]);

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch attendance details" });
  }
};


// --- Get stats by date range ---
// --- Get stats by date range ---
exports.getStatsByRange = async (req, res) => {
  try {
    console.log("hit range");
    const { startDate, endDate, academicYear, term } = req.query;

    console.log(req.query);

    if (!startDate || !endDate || !academicYear || !term) {
      return res.status(400).json({ error: "Missing required query params" });
    }

    const records = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          academicYear: academicYear, // ✅ keep as string
          term,
          school: req.user.school
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("records", records);
    res.json(records);
  } catch (err) {
    console.error("Error in /attendance/range", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- Get chronic absentees ---
exports.getAbsenteeListRange = async (req, res) => {
  try {
    console.log("hit absentees");
    const { days = 7, academicYear, term } = req.query;
    console.log(req.query);

    if (!academicYear || !term) {
      return res.status(400).json({ error: "Missing required query params" });
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - Number(days));

    const absentees = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: sinceDate },
          academicYear: academicYear, // ✅ keep as string
          term,
          status: "absent",
        },
      },
      {
        $group: {
          _id: "$student",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    console.log("absentees", absentees);

    const withStudents = await Student.populate(absentees, {
      path: "_id",
      select: "firstName lastName classLevel",
    });

    res.json(
      withStudents.map((a) => ({
        _id: a._id._id,
        firstName: a._id.firstName,
        lastName: a._id.lastName,
        classLevel: a._id.classLevel,
        count: a.count,
      }))
    );
  } catch (err) {
    console.error("Error in /attendance/absentees", err);
    res.status(500).json({ error: "Server error" });
  }
};


// --- Get class-level stats (admin dashboard) ---
exports.getClassStats = async (req, res) => {
  try {
    const { startDate, endDate, academicYear } = req.query;
    const requester = await User.findById(req.user.userId);

    if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const year = getAcademicYear(academicYear);

    const filter = {
      date: { $gte: start, $lte: end },
      academicYear: year,
      school: requester.school,
    };

    const records = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            classLevel: "$classLevel",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
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
          markCount: { $sum: 1 },
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
