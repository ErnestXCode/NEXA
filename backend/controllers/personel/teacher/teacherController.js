const mongoose = require("mongoose");
const User = require("../../../models/User");

// Get teacher by ID
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== "teacher") return res.status(404).json({ msg: "teacher not found" });
    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching teacher", error: err.message });
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "teacher not found" });
    res.status(200).json({ msg: "teacher updated successfully", teacher: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating teacher", error: err.message });
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "teacher not found" });
    res.status(200).json({ msg: "teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting teacher", error: err.message });
  }
};

// Get all teachers (filtered by school if not superadmin)
const getAllTeachers = async (req, res) => {
  try {
    const requester = req.user;

    let query = { role: "teacher" };

    if (requester.role === "admin") {
      query.school = requester.school; // school-specific teachers
    }

    // superadmin sees all teachers
    const teachers = await User.find(query);
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching teachers", error: err.message });
  }
};


module.exports = {
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getAllTeachers,
};
