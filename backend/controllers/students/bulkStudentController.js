const Activity = require("../../models/Activity");
const Student = require("../../models/Student");
const User = require("../../models/User");

const bulkCreateStudents = async (req, res) => {
  try {
    const { students } = req.body;
    const requester = req.user; // logged-in admin or teacher
    const requesterDoc = await User.findOne({ email: requester.email });

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ msg: "No student data provided" });
    }

    const studentsToSave = students.map((stu) => ({
      ...stu,
      school: requester.school,
    }));

    const createdStudents = await Student.insertMany(studentsToSave);

    // log all new students as activities
    const activities = createdStudents.map((stu) => ({
      type: "student",
      description: `New student ${stu.firstName} ${stu.lastName} registered`,
      createdBy: requesterDoc._id,
      school: requester.school,
    }));

    await Activity.insertMany(activities);

    res.status(201).json({ msg: `${createdStudents.length} students registered successfully` });
  } catch (err) {
    res.status(500).json({ msg: "Error creating students", error: err.message });
  }
};
module.exports = bulkCreateStudents