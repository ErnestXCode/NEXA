const Exam = require("../../models/Exam");
const Student = require("../../models/Student");
const School = require("../../models/School");

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

// Record results for students
const recordResult = async (req, res) => {
  try {
    const { examId, studentResults } = req.body;

    if (!examId || !Array.isArray(studentResults)) {
      return res.status(400).json({ msg: "Exam ID and student results are required" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    const school = await School.findById(exam.school);
    if (!school) return res.status(404).json({ msg: "School not found" });

    const gradingSystem =
      school.gradingSystem && school.gradingSystem.length > 0
        ? school.gradingSystem
        : School.defaultGradingSystem();

    const updatedStudents = [];

    for (let s of studentResults) {
      const student = await Student.findById(s.studentId);
      if (!student) continue;

      const total = s.subjects.reduce((acc, sub) => acc + sub.score, 0);
      const average = s.subjects.length > 0 ? total / s.subjects.length : 0;

      // Apply school's grading system
      let grade = "N/A";
      let remark = "";
      for (let g of gradingSystem) {
        if (average >= g.min && average <= g.max) {
          grade = g.grade;
          remark = g.remark || "";
          break;
        }
      }

      student.examResults.push({
        exam: exam._id,
        term: exam.term,
        subjects: s.subjects,
        total,
        average,
        grade,
        remark,
      });

      await student.save();
      updatedStudents.push({
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        grade,
        remark,
        average,
      });
    }

    res.status(200).json({ msg: "Results recorded", updatedStudents });
  } catch (err) {
    res.status(500).json({ msg: "Error recording results", error: err.message });
  }
};

// Get student report card by term
const getReportCard = async (req, res) => {
  try {
    const { studentId, term } = req.params;

    const student = await Student.findById(studentId).populate("examResults.exam");
    if (!student) return res.status(404).json({ msg: "Student not found" });

    const termResults = student.examResults.filter((r) => r.term === term);

    res.status(200).json({
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        classLevel: student.classLevel,
        stream: student.stream,
      },
      termResults,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching report card", error: err.message });
  }
}

module.exports = {
  createExam,
  getAllExams,
  recordResult,
  getReportCard,
};
