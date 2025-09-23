const Exam = require("../../models/Exam");
const Student = require("../../models/Student");
const School = require("../../models/School");
const { getAllowedSubjectsForClass } = require("../../utils/subjectHelper");

/**
 * Helper: compute grade & remark from school's grading system given average
 */
// function computeGrade(average, gradingSystem) {
//   if (!Array.isArray(gradingSystem) || gradingSystem.length === 0) {
//     gradingSystem = School.defaultGradingSystem();
//   }
//   for (let g of gradingSystem) {
//     if (average >= g.min && average <= g.max) {
//       return { grade: g.grade, remark: g.remark || "" };
//     }
//   }
//   return { grade: "N/A", remark: "" };
// }

// Create exam (whole school)
const createExam = async (req, res) => {
  try {
    const { name, term, date, academicYear } = req.body;
    const school = req.user.school;

    if (!name || !term || !date || !academicYear) {
      return res
        .status(400)
        .json({ msg: "Name, term, date, and academicYear are required" });
    }

    const exam = new Exam({ name, term, date, school, academicYear });
    await exam.save();

    res.status(201);
  } catch (err) {
    res.status(500).json({ msg: "Error creating exam", error: err.message });
  }
};

// Get all exams for a school (optionally filter by academicYear)
const getAllExams = async (req, res) => {
  try {
    const school = req.user.school;
    const { academicYear } = req.query;

    const filter = { school };
    if (academicYear) filter.academicYear = academicYear;

    const exams = await Exam.find(filter).sort({ date: -1 });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching exams", error: err.message });
  }
};

/**
 * Upsert results for many students.
 * Accepts: { examId, studentResults: [{ studentId, subjects: [{name, score}] }, ...] }
 */
function computeCBCGrade(score, gradingSystem) {
  if (!Array.isArray(gradingSystem) || gradingSystem.length === 0) {
    gradingSystem = School.defaultGradingSystem();
  }
  for (let g of gradingSystem) {
    if (score >= g.min && score <= g.max) {
      return { grade: g.grade, remark: g.remark || "" };
    }
  }
  return { grade: "N/A", remark: "" };
}

/**
 * Upsert results for many students.
 * Accepts: { examId, studentResults: [{ studentId, subjects: [{name, score}] }, ...] }
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

      // ✅ 1. Determine allowed subjects for this student based on classLevel
      const allowedSubjects = getAllowedSubjectsForClass(
        school,
        student.classLevel
      );

      // ✅ 2. Filter/clean subjects against allowed list + assign CBC grade
      const cleanSubjects = subjects
        .filter((s) => allowedSubjects.includes(s.name))
        .map((s) => {
          const score = typeof s.score === "number" ? s.score : Number(s.score || 0);
          const { grade, remark } = computeCBCGrade(score, gradingSystem);
          return { name: s.name, score, grade, remark };
        });

      const total = cleanSubjects.reduce((acc, s) => acc + (s.score || 0), 0);
      const average =
        cleanSubjects.length > 0 ? total / cleanSubjects.length : 0;

      const examResultObj = {
        exam: exam._id,
        term: exam.term,
        academicYear: exam.academicYear,
        subjects: cleanSubjects, // ✅ per subject grading
        total,
        average,
      };

      const idx = (student.examResults || []).findIndex(
        (er) => er.exam?.toString() === examId.toString()
      );

      if (idx >= 0) {
        student.examResults[idx] = {
          ...(student.examResults[idx].toObject
            ? student.examResults[idx].toObject()
            : student.examResults[idx]),
          ...examResultObj,
        };
      } else {
        student.examResults = student.examResults || [];
        student.examResults.push(examResultObj);
      }

      await student.save();

      updatedStudents.push({
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        average,
        total,
      });
    }

    res.status(200).json({ msg: "Results recorded" });
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
 */
const getResultsForExamClass = async (req, res) => {
  try {
    const { examId, classLevel, subject } = req.params;
    if (!examId || !classLevel) {
      return res
        .status(400)
        .json({ msg: "examId and classLevel are required" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    const school = await School.findById(exam.school);
    if (!school) return res.status(404).json({ msg: "School not found" });

    const students = await Student.find({ school: school._id, classLevel });

    const results = students.map((s) => {
      const er = (s.examResults || []).find(
        (r) =>
          r.exam?.toString() === examId.toString() &&
          r.academicYear === exam.academicYear // ✅ Match academicYear
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
