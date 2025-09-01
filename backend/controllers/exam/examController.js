const Exam = require("../../models/Exam");
const Student = require("../../models/Student");

// Create exam (teacher/admin)
const createExam = async (req, res) => {
  try {
    const { name, term, classes, date } = req.body;
    const school = req.user.school;

    const exam = new Exam({ name, term, classes, date, school });
    await exam.save();

    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ msg: "Error creating exam", error: err.message });
  }
};

// Get all exams (school-scoped)
const getAllExams = async (req, res) => {
  try {
    const school = req.user.school;
    const exams = await Exam.find({ school });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching exams", error: err.message });
  }
};

// Record results (Excel-like table or CSV)
const recordResult = async (req, res) => {
  try {
    const { examId, studentResults } = req.body;
    // studentResults = [{ studentId, subjects: [{name, score}] }]

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    const updatedStudents = [];

    for (let s of studentResults) {
      const student = await Student.findById(s.studentId);
      if (!student) continue;

      const total = s.subjects.reduce((acc, sub) => acc + sub.score, 0);
      const average = total / s.subjects.length;
      const grade =
        average >= 80 ? "A" :
        average >= 70 ? "B" :
        average >= 60 ? "C" :
        average >= 50 ? "D" : "E";

      student.examResults.push({
        exam: exam._id,
        term: exam.term,
        subjects: s.subjects,
        total,
        average,
        grade
      });

      await student.save();
      updatedStudents.push(student);
    }

    res.status(200).json({ msg: "Results recorded", updatedStudents });
  } catch (err) {
    res.status(500).json({ msg: "Error recording results", error: err.message });
  }
};

// Get student report card
const getReportCard = async (req, res) => {
  try {
    const { studentId, term } = req.params;
    const student = await Student.findById(studentId).populate("examResults.exam");
    if (!student) return res.status(404).json({ msg: "Student not found" });

    const termResults = student.examResults.filter(r => r.term === term);
    res.status(200).json({ student, termResults });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching report card", error: err.message });
  }
};

module.exports = {
  createExam,
  getAllExams,
  recordResult,
  getReportCard
};
