const mongoose = require("mongoose");
const Student = require("../../models/Student");

// Create a new student
const createStudent = async (req, res) => {
  try {
    const data = req.body;
    const requester = req.user; // logged-in admin or teacher
    if (!data) return res.status(400).json({ msg: "No student data provided" });

    const newStudent = new Student({
      ...data,
      school: requester.school,
    });

    const created = await newStudent.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ msg: "Error creating student", error: err.message });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ msg: "Student not found" });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching student", error: err.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Student.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Student not found" });
    res.status(200).json({ msg: "Student updated successfully", student: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating student", error: err.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "Student not found" });
    res.status(200).json({ msg: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting student", error: err.message });
  }
};

// Get all students (optionally filtered by school)
const getAllStudents = async (req, res) => {
  try {
    const requester = req.user;

    let query = {};

    if (requester.role !== "superadmin") {
      query.school = requester.school; // restrict to their school
    }

    const students = await Student.find(query);
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching students", error: err.message });
  }
};


module.exports = {
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getAllStudents,
};
