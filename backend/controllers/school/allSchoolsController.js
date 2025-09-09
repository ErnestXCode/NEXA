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
// URL: GET /schools/subjects/:classLevel
const getSubjectsForClass = async (req, res) => {
  try {
    const classLevel = req.params.classLevel;
    // prefer the requester's school if available
    const schoolId = req.user?.school;
    const school = await School.findById(schoolId)
    if (!school) return res.status(404).json({ msg: "School not found" });

    // find matched subjects rules
    let matched = [];
    if (Array.isArray(school.subjectsByClass) && school.subjectsByClass.length) {
      matched = school.subjectsByClass.filter((rule) =>
        isClassInRange(classLevel, rule.fromClass, rule.toClass, school.classLevels || [])
      );
    }

    // if matched, merge all subject arrays (unique)
    if (matched.length) {
      const combined = Array.from(new Set(matched.flatMap((m) => m.subjects || [])));
      return res.status(200).json({ subjects: combined });
    }

    // fallback to class-level subjects (if you store them per-class) OR global subjects
    const classDef = (school.classLevels || []).find((c) => c.name === classLevel);
    if (classDef && classDef.subjects && classDef.subjects.length) {
      return res.status(200).json({ subjects: classDef.subjects });
    }

    // final fallback: school.subjects
    return res.status(200).json({ subjects: school.subjects || [] });
  } catch (err) {
    console.error(err);
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
