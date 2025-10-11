const Exam = require("../../models/Exam");
const Student = require("../../models/Student");
const Message = require("../../models/Message");
const School = require("../../models/School");
const { getAllowedSubjectsForClass } = require("../../utils/subjectHelper");


// Create exam (whole school)
const createExam = async (req, res) => {
  try {
    const { name, term, date, academicYear } = req.body;
    const school = req.user.school;
    const sender = req.user;

    if (!name || !term || !date || !academicYear) {
      return res
        .status(400)
        .json({ msg: "Name, term, date, and academicYear are required" });
    }

    const exam = new Exam({ name, term, date, school, academicYear });
    await exam.save();

    // --- Automatic in-app message ---
    const io = req.app.get("io");

   const messageBody = `A new exam "${name}" (${term}, ${academicYear}) is scheduled on ${new Date(date).toLocaleDateString()}. Please check your schedules.`;


    const newMessage = await Message.create({
      sender: sender.userId,
      school: school,
      subject: "New Exam Created",
      body: messageBody,
      type: "chat",
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name email role"
    );

    // Emit in-app notification via Socket.IO
    io.to(school.toString()).emit("newMessage", populatedMessage);

    res.status(201).json({ exam, message: "Exam created and notification sent." });
  } catch (err) {
    console.error(err);
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
    const {userId} = req.user
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
        recordedBy: userId, // ✅ add for audit
        recordedAt: new Date(), // ✅ timestamp
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


const getResultsAudit = async (req, res) => {
  try {
    const { examId, classLevel, academicYear, term } = req.query;
    const filter = {
      school: req.user.school
    };
    if (classLevel) filter.classLevel = classLevel;
    if (academicYear) filter["examResults.academicYear"] = academicYear;
    if (term) filter["examResults.term"] = term;

    const students = await Student.find(filter).populate({
      path: "examResults.recordedBy",
      select: "name role",
    });

    const auditLogs = [];

    students.forEach((student) => {
      (student.examResults || []).forEach((er) => {
        // Skip if no subjects recorded
        if (!er.subjects || er.subjects.length === 0) return;

        if (examId && er.exam.toString() !== examId) return;
        if (academicYear && er.academicYear !== academicYear) return;
        if (term && er.term !== term) return;

        auditLogs.push({
          student: `${student.firstName} ${student.lastName}`,
          classLevel: student.classLevel,
          exam: er.exam,
          subjects: er.subjects,
          total: er.total,
          average: er.average,
          recordedBy: er.recordedBy
            ? `${er.recordedBy.name} (${er.recordedBy.role})`
            : "N/A",
          recordedAt: er.recordedAt,
        });
      });
    });

    // ⚡ Sort descending by recordedAt (most recent first)
    auditLogs.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));

    res.json(auditLogs);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Error fetching audit logs", error: err.message });
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

// Update exam
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, term, date, academicYear } = req.body;
    const school = req.user.school;

    const exam = await Exam.findOneAndUpdate(
      { _id: id, school },
      { name, term, date, academicYear },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found or unauthorized" });
    }

    res.status(200).json({ msg: "Exam updated successfully", exam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating exam", error: err.message });
  }
};


module.exports = {
  createExam,
  getAllExams,
  updateExam,
  getResultsAudit,
  recordResult,
  getResultsForExamClass,
};
