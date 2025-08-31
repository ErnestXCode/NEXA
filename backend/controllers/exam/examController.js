const Activity = require("../../models/Activity");
const Exam = require("../../models/Exam");
const Student = require("../../models/Student");
const User = require("../../models/User");


// Create exam (teacher/admin)
const createExam = async (req, res) => {
    console.log('hit exam')
  try {
    const requester = req.user;
    const requesterDoc = await User.findOne({email: requester.email})
    const exam = new Exam({ ...req.body, school: requester.school });
    const saved = await exam.save();

    const newLog = new Activity({
          type: "exam",
          description: `Exam added, ${exam.name} at ${exam.date}`,
          createdBy: requesterDoc._id,
          school: requester.school,
        });
    
        await newLog.save();

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
    const { examId, studentId, results } = req.body;
    // results = [{ subject: "Math", score: 80 }, { subject: "English", score: 70 }]

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    let total = 0;
    results.forEach(r => total += r.score);
    const average = total / results.length;

    const grade = average >= 80 ? "A" :
                  average >= 70 ? "B" :
                  average >= 60 ? "C" :
                  average >= 50 ? "D" : "E";

    student.examResults.push({
      exam: examId,
      term: exam.term,
      results,
      total,
      average,
      grade,
    });

    await student.save();

    res.status(200).json({ msg: "Results recorded", student });
  } catch (err) {
    res.status(500).json({ msg: "Error recording result", error: err.message });
  }
};


const getReportCard = async (req, res) => {
  try {
    const { studentId, term } = req.params;
    const student = await Student.findById(studentId)
      .populate("examResults.exam");
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
  getExamById,
  updateExam,
  deleteExam,
  getReportCard,
  recordResult,
};
