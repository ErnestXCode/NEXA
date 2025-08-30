const Exam = require("../../models/Exam");
const Student = require("../../models/Student");


// Create exam (teacher/admin)
const createExam = async (req, res) => {
    console.log('hit exam')
  try {
    const requester = req.user;
    const exam = new Exam({ ...req.body, school: requester.school });
    const saved = await exam.save();
    res.status(201).json(saved);
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Error creating exam", error: err.message });
  }
};

// Get all exams (school-scoped)
const getAllExams = async (req, res) => {
  try {
    const requester = req.user;
    const query = requester.role === "superadmin" ? {} : { school: requester.school };
    const exams = await Exam.find(query);
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching exams", error: err.message });
  }
};

// Get exam by ID
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });
    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching exam", error: err.message });
  }
};

// Update exam
const updateExam = async (req, res) => {
  try {
    const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Exam not found" });
    res.status(200).json({ msg: "Exam updated", exam: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating exam", error: err.message });
  }
};

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const deleted = await Exam.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Exam not found" });
    res.status(200).json({ msg: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting exam", error: err.message });
  }
};

// Record exam results for students
const recordResult = async (req, res) => {
  try {
    const { examId, studentId, score, grade } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    student.examResults.push({
      examName: examId,
      subject: req.body.subject,
      date: new Date(),
      score,
      grade,
    });

    await student.save();
    res.status(200).json({ msg: "Result recorded successfully", student });
  } catch (err) {
    res.status(500).json({ msg: "Error recording result", error: err.message });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  recordResult,
};
