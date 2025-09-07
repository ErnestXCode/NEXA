const PDFDocument = require("pdfkit");
const archiver = require("archiver");
const Student = require("../../models/Student");
const Exam = require("../../models/Exam");
const School = require("../../models/School");

/**
 * Generate PDF for a single student
 */
async function generateStudentReport(student, exam, school, res) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const chunks = [];
      doc.on("data", chunks.push.bind(chunks));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // --- Header
      doc.fontSize(16).text(school.name || "School Name", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Exam Report: ${exam.name}`, { align: "center" });
      doc.moveDown();

      // --- Student details
      doc.fontSize(12).text(`Name: ${student.firstName} ${student.lastName}`);
      doc.text(`Class: ${student.classLevel}`);
      doc.text(`Exam: ${exam.name} (${exam.term})`);
      doc.moveDown();

      // --- Results
      const er = (student.examResults || []).find(
        (r) => r.exam?.toString() === exam._id.toString()
      );
      if (!er) {
        doc.text("No results found.");
      } else {
        doc.text("Subjects & Scores:", { underline: true });
        er.subjects.forEach((s) => {
          doc.text(`${s.name}: ${s.score}`);
        });
        doc.moveDown();
        doc.text(`Total: ${er.total}`);
        doc.text(`Average: ${er.average.toFixed(2)}`);
        doc.text(`Grade: ${er.grade}`);
        if (er.remark) doc.text(`Remark: ${er.remark}`);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Download single student report
 */
const downloadStudentReport = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    const student = await Student.findById(studentId);
    const exam = await Exam.findById(examId);
    const school = await School.findById(student.school);

    if (!student || !exam || !school) {
      return res.status(404).json({ msg: "Data not found" });
    }

    const pdfBuffer = await generateStudentReport(student, exam, school, res);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${student.firstName}_${student.lastName}_Report.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error generating report", error: err.message });
  }
};

/**
 * Download all reports for a class (zipped)
 */
const downloadClassReports = async (req, res) => {
  try {
    const { examId, classLevel } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    const students = await Student.find({ school: exam.school, classLevel });
    const school = await School.findById(exam.school);

    if (!students.length) {
      return res.status(404).json({ msg: "No students found" });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${classLevel.replace(/\s+/g, "_")}_Reports.zip`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (const student of students) {
      const pdfBuffer = await generateStudentReport(student, exam, school);
      archive.append(pdfBuffer, {
        name: `${student.firstName}_${student.lastName}.pdf`,
      });
    }

    archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error generating class reports", error: err.message });
  }
};

module.exports = {
  downloadStudentReport,
  downloadClassReports,
};
