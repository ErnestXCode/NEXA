const School = require("../../models/School");
const { getAllowedSubjectsForClass } = require("../../utils/subjectHelper");

// Get all schools (superadmin only)
const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching schools", error: err.message });
  }
};

const getMySchool = async (req, res) => {
  try {
    const school =await School.findById(req.user.school);
    res.status(200).json(school);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching school", error: err.message });
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

// Update school info (by id)
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

// Helper: check if className is within fromClass..toClass range based on the school's classLevels order
const isClassInRange = (className, fromClass, toClass, allClasses = []) => {
  const idx = allClasses.findIndex((c) => c.name === className);
  const fromIdx = allClasses.findIndex((c) => c.name === fromClass);
  const toIdx = allClasses.findIndex((c) => c.name === toClass);
  if (idx === -1 || fromIdx === -1 || toIdx === -1) return false;
  const min = Math.min(fromIdx, toIdx);
  const max = Math.max(fromIdx, toIdx);
  return idx >= min && idx <= max;
};

// NEW: Get subjects for a specific class (uses subjectsByClass rules if present)
// GET /schools/subjects/:classLevel
const getSubjectsForClass = async (req, res) => {
  try {
    const school = await School.findById(req.user.school);
    if (!school) return res.status(404).json({ msg: "School not found" });

    const { classLevel } = req.params;
    const cls = school.classLevels.find(c => c.name === classLevel);
    if (!cls) return res.status(404).json({ msg: "Class not found" });

    // 1️⃣ Collect subjects: class-specific + by-range + global
    let subjects = getAllowedSubjectsForClass(school, classLevel);

    // 2️⃣ Restrict for teachers
    if (req.user.role === "teacher") {
      const teacher = await User.findById(req.user.userId);
      if (teacher && teacher.subjects.length > 0) {
        subjects = subjects.filter(s => teacher.subjects.includes(s));
      }
    }

    res.json({ subjects });
  } catch (err) {
    console.error("Error fetching subjects for class", err);
    res.status(500).json({ msg: "Error fetching subjects", error: err.message });
  }
};


module.exports = {
  getAllSchools,
  getSchoolById,
  getMySchool,
  createSchool,
  updateSchool,
  deleteSchool,
  getSubjectsForClass,
};
