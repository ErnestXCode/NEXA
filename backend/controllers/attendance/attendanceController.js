const Attendance = require("../../models/Attendance");
const Student = require("../../models/Student");
const User = require("../../models/User");

// Mark attendance
// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const requester = req.user;
    const { student, classLevel, stream, status, date } = req.body;

    const requesterDoc = await User.findOne({ email: requester.email });

    const attendanceDate = new Date(date || new Date());
    attendanceDate.setHours(0, 0, 0, 0); // normalize to start of day

    // 🔒 Check if this class already has attendance for the day
    const alreadyMarked = await Attendance.findOne({
      classLevel,
      stream,
      school: requester.school,
      date: { 
        $gte: attendanceDate, 
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000) 
      }
    });

    if (alreadyMarked) {
      return res.status(400).json({ msg: "Attendance already marked for this class today" });
    }

    const attendance = new Attendance({
      student,
      classLevel,
      stream,
      status,
      date: attendanceDate,
      markedBy: requesterDoc._id,
      school: requester.school,
    });

    const saved = await attendance.save();
    res.status(201).json(saved);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error marking attendance", error: err.message });
  }
};


// Get attendance for a student
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const requester = req.user;
    const query = { student: studentId };

    if (requester.role !== "superadmin") query.school = requester.school;

    const records = await Attendance.find(query);
    res.status(200).json(records);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching attendance", error: err.message });
  }
};

// Get attendance by class
const getClassAttendance = async (req, res) => {
  try {
    const { classLevel, stream } = req.query;
    const requester = req.user;
    const query = { classLevel };
    if (stream) query.stream = stream;
    if (requester.role !== "superadmin") query.school = requester.school;

    const records = await Attendance.find(query);
    res.status(200).json(records);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching class attendance", error: err.message });
  }
};

// General getAttendance - flexible query (student, class, date)
const getAttendance = async (req, res) => {
  try {
    const requester = req.user;
    const { studentId, classLevel, stream, date, status } = req.query;

    const query = {};
    if (studentId) query.student = studentId;
    if (classLevel) query.classLevel = classLevel;
    if (status) query.status = status;
    if (stream) query.stream = stream;
    if (date) query.date = new Date(date);
    if (requester.role !== "superadmin") query.school = requester.school;

    const records = await Attendance.find(query).populate("student", "firstName lastName classLevel");
    res.status(200).json(records);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching attendance", error: err.message });
  }
};

const getHighAbsenteeism = async (req, res) => {
  try {
    const requester = req.user;

    const query = {};
    if (requester.role !== "superadmin") query.school = requester.school;

    // Aggregate absences per student
    const results = await Attendance.aggregate([
      { $match: { ...query, status: "absent" } },
      { $group: { _id: "$student", absences: { $sum: 1 } } },
      { $match: { absences: { $gt: 3 } } },
      { $sort: { absences: -1 } },
    ]);

    // Populate student details
    const students = await Student.find({ _id: { $in: results.map(r => r._id) } })
      .select("firstName lastName classLevel parentEmail parentPhone");

    // Merge absence counts
    const highAbsentees = students.map((s) => {
      const count = results.find(r => r._id.toString() === s._id.toString()).absences;
      return { ...s.toObject(), absences: count };
    });

    res.status(200).json(highAbsentees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching high absenteeism", error: err.message });
  }
};

// 2️⃣ Notify parents of high absenteeism
const notifyParents = async (req, res) => {
  try {
    const { students } = req.body; // array of students with parentEmail/parentPhone

    if (!students || students.length === 0)
      return res.status(400).json({ msg: "No students to notify" });

    // TODO: integrate email/SMS sending here
    students.forEach((s) => {
      // Example pseudo-code:
      // sendEmail(s.parentEmail, `Your child ${s.firstName} has ${s.absences} absences`);
      // sendSMS(s.parentPhone, `Your child ${s.firstName} has ${s.absences} absences`);
      console.log(`Notify ${s.parentEmail} / ${s.parentPhone}: ${s.firstName} - ${s.absences} absences`);
    });

    res.status(200).json({ msg: "Notifications sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error notifying parents", error: err.message });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getHighAbsenteeism, 
  notifyParents,
  getClassAttendance,
  getAttendance,
};
