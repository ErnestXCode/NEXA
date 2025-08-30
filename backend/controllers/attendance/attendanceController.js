const Attendance = require("../../models/Attendance");


// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const requester = req.user;
    const { student, classLevel, stream, status, date } = req.body;

    const attendance = new Attendance({
      student,
      classLevel,
      stream,
      status,
      date: date || new Date(),
      markedBy: requester._id,
      school: requester.school,
    });

    const saved = await attendance.save();
    res.status(201).json(saved);
  } catch (err) {
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
    res.status(500).json({ msg: "Error fetching attendance", error: err.message });
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
    res.status(500).json({ msg: "Error fetching class attendance", error: err.message });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
};
