const School = require("../../models/School");

// Get all schools (superadmin only)
const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching schools", error: err.message });
  }
};

// Get single school by ID
const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ msg: "School not found" });
    res.status(200).json(school);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching school", error: err.message });
  }
};

// Create a school (superadmin only)
const createSchool = async (req, res) => {
  try {
    const newSchool = new School(req.body);
    const saved = await newSchool.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ msg: "Error creating school", error: err.message });
  }
};

// Update school info
const updateSchool = async (req, res) => {
  try {
    const updated = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "School not found" });
    res.status(200).json({ msg: "School updated", school: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating school", error: err.message });
  }
};

// Delete school
const deleteSchool = async (req, res) => {
  try {
    const deleted = await School.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "School not found" });
    res.status(200).json({ msg: "School deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting school", error: err.message });
  }
};

module.exports = {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
};
