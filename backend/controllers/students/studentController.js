const mongoose = require("mongoose");
const Student = require("../../models/Student");
const Activity = require("../../models/Activity");
const User = require("../../models/User");
const School = require("../../models/School");
const { getAllowedSubjectsForClass } = require("../../utils/subjectHelper");

// Create a new student
const createStudent = async (req, res) => {
  try {
    const data = req.body;
    const requester = req.user; // logged-in admin or teacher
    const requesterDoc = await User.findById(requester.userId);

    if (!data) return res.status(400).json({ msg: "No student data provided" });

    // Teachers can only add to their class
    if (requester.role === "teacher" && requesterDoc.isClassTeacher) {
      data.classLevel = requesterDoc.classLevel;
    } else if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const newStudent = new Student({
      ...data,
      school: requester.school,
    });

    const created = await newStudent.save();

    const newLog = new Activity({
      type: "student",
      description: `New student ${newStudent.firstName} ${newStudent.lastName} registered`,
      createdBy: requesterDoc._id,
      school: requester.school,
    });

    await newLog.save();

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ msg: "Error creating student", error: err.message });
  }
};

// Promote all students to next class level
const promoteStudentsNextYear = async (req, res) => {
  try {
    const requester = req.user;

    // Only admin/superadmin can promote
    if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Get all students in the school
    const students = await Student.find({ school: requester.school });

    const updatedStudents = [];

    for (let student of students) {
      // Skip if already at highest class (optional)
      if (student.classLevel >= 12) continue;

      // Increment classLevel by 1
      student.classLevel += 1;

      await student.save();
      updatedStudents.push(student);
    }

    res.status(200).json({
      msg: "Students promoted successfully",
      count: updatedStudents.length,
      promotedStudents: updatedStudents,
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error promoting students", error: err.message });
  }
};


// Get student by ID with role-based access
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;
    const requesterDoc = await User.findById(requester.userId);

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Access control
    if (requester.role === "teacher" && requesterDoc.isClassTeacher) {
      if (
        student.classLevel !== requesterDoc.classLevel ||
        student.school.toString() !== requester.school.toString()
      ) {
        return res.status(403).json({ msg: "Unauthorized" });
      }
    } else if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching student", error: err.message });
  }
};

// Update student by ID with role-based access
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;
    const requesterDoc = await User.findById(requester.userId);

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Access control
    if (requester.role === "teacher" && requesterDoc.isClassTeacher) {
      if (
        student.classLevel !== requesterDoc.classLevel ||
        student.school.toString() !== requester.school.toString()
      ) {
        return res.status(403).json({ msg: "Unauthorized" });
      }
      // Teachers can only update certain fields if needed
      req.body.classLevel = student.classLevel; // prevent changing class
    } else if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const updated = await Student.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({ msg: "Student updated successfully", student: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating student", error: err.message });
  }
};

// Delete student by ID with role-based access
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;
    const requesterDoc = await User.findById(requester.userId);

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Access control
    if (requester.role === "teacher" && requesterDoc.isClassTeacher) {
      if (
        student.classLevel !== requesterDoc.classLevel ||
        student.school.toString() !== requester.school.toString()
      ) {
        return res.status(403).json({ msg: "Unauthorized" });
      }
    } else if (!["admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Student.findByIdAndDelete(id);
    res.status(200).json({ msg: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting student", error: err.message });
  }
};

// Get all students with role-based access
const getAllStudents = async (req, res) => {
  try {
    const requester = req.user;
    let query = {};
    const requesterDoc = await User.findById(req.user.userId);

    if (requester.role === "teacher" && requesterDoc.isClassTeacher) {
      query.classLevel = requesterDoc.classLevel;
      query.school = requester.school;
    } else if (!["admin", "superadmin", "bursar"].includes(requester.role)) {
      return res.status(403).json({ msg: "Unauthorized" });
    } else {
      query.school = requester.school;
    }

    const students = await Student.find(query).populate({
      path: "guardian",
      select: "name email phoneNumber",
    });

    res.status(200).json(students);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching students", error: err.message });
  }
};
const getStudentsWithSubjects = async (req, res) => {
  try {
    const school = await School.findById(req.user.school);
    if (!school) {
      return res.status(404).json({ msg: "School not found" });
    }

    const students = await Student.find({ school: req.user.school });

    // Build subjects per classLevel
    let subjectsByClass = {};
    students.forEach((s) => {
      if (!subjectsByClass[s.classLevel]) {
        subjectsByClass[s.classLevel] = getAllowedSubjectsForClass(
          school,
          s.classLevel
        );
      }
    });

    // 🔒 Restrict if teacher
    if (req.user.role === "teacher") {
      const teacher = await User.findById(req.user.userId);
      if (teacher && teacher.subjects.length > 0) {
        for (let classLevel in subjectsByClass) {
          subjectsByClass[classLevel] = subjectsByClass[classLevel].filter(
            (subj) => teacher.subjects.includes(subj)
          );
        }
      }
    }

    res.json({ students, subjectsByClass });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching students", error: err.message });
  }
};



module.exports = {
  createStudent,
  getStudentById,
  updateStudent,
  promoteStudentsNextYear,
  deleteStudent,
  getStudentsWithSubjects,
  getAllStudents,
};
