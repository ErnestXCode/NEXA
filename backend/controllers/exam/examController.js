const Exam = require("../../models/Exam");
const Student = require("../../models/Student");
const School = require("../../models/School");
const User = require("../../models/User");

/**
 * Helper: compute grade & remark from school's grading system given average
 */
function computeGrade(average, gradingSystem) {
  if (!Array.isArray(gradingSystem) || gradingSystem.length === 0) {
    gradingSystem = School.defaultGradingSystem();
  }
  for (let g of gradingSystem) {
    if (average >= g.min && average <= g.max) {
      return { grade: g.grade, remark: g.remark || "" };
    }
  }
  return { grade: "N/A", remark: "" };
}

// Create exam (whole school)
const createExam = async (req, res) => {
  try {
    const { name, term, date } = req.body;
    const school = req.user.school;

    if (!name || !term || !date) {
      return res.status(400).json({ msg: "Name, term and date are required" });
    }

    const exam = new Exam({ name, term, date, school });
    await exam.save();

    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ msg: "Error creating exam", error: err.message });
  }
};

// Get all exams for a school
const getAllExams = async (req, res) => {
  try {
    const school = req.user.school;
    const exams = await Exam.find({ school }).sort({ date: -1 });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching exams", error: err.message });
  }
};

/**
 * Upsert results for many students.
 * Accepts: { examId, studentResults: [{ studentId, subjects: [{name, score}] }, ...] }
 * For each student, this will upsert a single entry in student.examResults for that exam.
 */
const recordResult = async (req, res) => {
  try {
    const { examId, studentResults } = req.body;
    if (!examId || !Array.isArray(studentResults)) {
      return res
        .status(400)
        .json({ msg: "Exam ID and student results are required" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    const school = await School.findById(exam.school);
    if (!school) return res.status(404).json({ msg: "School not found" });

    const gradingSystem =
      Array.isArray(school.gradingSystem) && school.gradingSystem.length
        ? school.gradingSystem
        : School.defaultGradingSystem();

    const updatedStudents = [];

    for (let entry of studentResults) {
      const { studentId, subjects } = entry;
      if (!studentId || !Array.isArray(subjects)) continue;

      const student = await Student.findById(studentId);
      if (!student) continue;

      // Find existing examResults index for this exam
      const idx = student.examResults
        ? student.examResults.findIndex(
            (er) => er.exam?.toString() === examId.toString()
          )
        : -1;

      // Build subjects array (ensure numbers)
      const cleanSubjects = subjects.map((s) => ({
        name: s.name,
        score: typeof s.score === "number" ? s.score : Number(s.score || 0),
      }));

      const total = cleanSubjects.reduce((acc, s) => acc + (s.score || 0), 0);
      const average =
        cleanSubjects.length > 0 ? total / cleanSubjects.length : 0;
      const { grade, remark } = computeGrade(average, gradingSystem);

      const examResultObj = {
        exam: exam._id,
        term: exam.term,
        subjects: cleanSubjects,
        total,
        average,
        grade,
        remark,
      };

      if (idx >= 0) {
        // Update existing
        student.examResults[idx] = {
          ...(student.examResults[idx].toObject
            ? student.examResults[idx].toObject()
            : student.examResults[idx]),
          ...examResultObj,
        };
      } else {
        // Push new
        student.examResults = student.examResults || [];
        student.examResults.push(examResultObj);
      }

      await student.save();

      updatedStudents.push({
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        average,
        grade,
        remark,
      });
    }

    res.status(200).json({ msg: "Results recorded", updatedStudents });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Error recording results", error: err.message });
  }
};

/**
 * GET existing saved results for an exam + classLevel
 * Query params: examId, classLevel, subject (optional)
 * Returns:
 *  { students: [ { _id, firstName, lastName, classLevel, savedSubjects: [{name,score}], total, average, grade } ], subjects: school.subjects }
 */
const getResultsForExamClass = async (req, res) => {
  try {
    const { examId, classLevel, subject } = req.params;
    console.log('llllll', req.params)
    if (!examId || !classLevel) {
      return res
        .status(400)
        .json({ msg: "examId and classLevel are required" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    const school = await School.findById(exam.school);
    if (!school) return res.status(404).json({ msg: "School not found" });

    // get students in class
    const students = await Student.find({ school: school._id, classLevel });

    // Build results
    const results = students.map((s) => {
      const er = (s.examResults || []).find(
        (r) => r.exam?.toString() === examId.toString()
      );

      let savedSubjects = [];
      if (er) {
        savedSubjects = Array.isArray(er.subjects)
          ? er.subjects.map((ss) => ({ name: ss.name, score: ss.score }))
          : [];
        if (subject) {
          savedSubjects = savedSubjects.filter((x) => x.name === subject);
        }
      }

      return {
        studentId: s._id,
        subjects: savedSubjects,
        total: er ? er.total : null,
        average: er ? er.average : null,
        grade: er ? er.grade : null,
        remark: er ? er.remark : null,
      };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


module.exports = {
  createExam,
  getAllExams,
  recordResult,
  getResultsForExamClass,
};
