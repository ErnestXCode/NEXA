const PDFDocument = require("pdfkit");
const archiver = require("archiver");
const Student = require("../../models/Student");
const Exam = require("../../models/Exam");
const School = require("../../models/School");

/**
 * Draw results table
 */
function drawResultsTable(doc, er, school) {
  const startX = 50;
  const startY = doc.y + 10;
  const rowHeight = 25;
  const colWidths = [200, 80, 80, 150]; // Subject, Score, Grade, Remark

  // --- Table headers
  doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
  doc.font("Helvetica-Bold").fontSize(12);

  const headers = ["Subject", "Score", "Grade", "Remark"];
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 5, startY + 7);
    x += colWidths[i];
  });

  // --- Table rows
  doc.font("Helvetica").fontSize(11);
  er.subjects.forEach((s, i) => {
    const y = startY + (i + 1) * rowHeight;

    // Alternate row background
    if (i % 2 === 0) {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#f2f2f2").stroke();
      doc.fillColor("black");
    } else {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
    }

    let grade = "-";
    let remark = "";
    if (s.score !== undefined && school.gradingSystem) {
      const grading = school.gradingSystem.find(
        (g) => s.score >= g.min && s.score <= g.max
      );
      if (grading) {
        grade = grading.grade;
        remark = grading.remark || "";
      }
    }

    const rowData = [s.name, s.score?.toString() || "-", grade, remark];
    let colX = startX;
    rowData.forEach((text, j) => {
      doc.text(text, colX + 5, y + 7, { width: colWidths[j] - 10 });
      colX += colWidths[j];
    });
  });

  doc.moveDown(2);
}

/**
 * Draw summary table for totals, average, grade
 */
function drawSummaryTable(doc, er) {
  const startX = 50;
  const startY = doc.y;
  const rowHeight = 30;
  const colWidths = [160, 160, 160]; // Total, Average, Grade

  // Headers
  doc.font("Helvetica-Bold").fontSize(12);
  let x = startX;
  const headers = ["Total Marks", "Average", "Grade"];
  doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
  headers.forEach((h, i) => {
    doc.text(h, x + 5, startY + 8, { width: colWidths[i] - 10, align: "center" });
    x += colWidths[i];
  });

  // Values
  doc.font("Helvetica").fontSize(13);
  const values = [
    er.total?.toString() || "-",
    er.average?.toFixed(2) || "-",
    er.grade || "-",
  ];
  let y = startY + rowHeight;
  x = startX;
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
  values.forEach((v, i) => {
    doc.text(v, x + 5, y + 8, { width: colWidths[i] - 10, align: "center" });
    x += colWidths[i];
  });

  doc.moveDown(3);
}

/**
 * Generate PDF for a single student
 */
async function generateStudentReport(student, exam, school) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const chunks = [];
      doc.on("data", chunks.push.bind(chunks));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // --- Header ---
      if (school.logoUrl) {
        try {
          doc.image(school.logoUrl, 50, 20, { width: 60 }).moveDown();
        } catch (e) {
          console.warn("Logo not found:", e.message);
        }
      }

      doc
        .fontSize(18)
        .text(school.name || "School Name", {
          align: "center",
          underline: true,
        });
      if (school.address) doc.text(school.address, { align: "center" });
      if (school.phone) doc.text(`Tel: ${school.phone}`, { align: "center" });
      doc.moveDown(1.5);

      doc
        .fontSize(14)
        .text(`Exam Report: ${exam.name} (${exam.term})`, { align: "center" });
      doc.moveDown(2);

      // --- Student details ---
      doc.fontSize(12).text(`Name: ${student.firstName} ${student.lastName}`);
      doc.text(`Admission No: ${student.admissionNumber || "-"}`);
      doc.text(`Class: ${student.classLevel}`);
      if (student.stream) doc.text(`Stream: ${student.stream}`);
      doc.text(`Exam Date: ${new Date(exam.date).toDateString()}`);
      doc.moveDown(1.5);

      // --- Results Table ---
      const er = (student.examResults || []).find(
        (r) => r.exam?.toString() === exam._id.toString()
      );

      if (!er) {
        doc.text("⚠ No results found for this exam.");
      } else {
        doc.fontSize(13).text("Subjects & Scores", { underline: true });
        doc.moveDown(0.5);

        drawResultsTable(doc, er, school);

        // --- Totals Summary Table ---
        drawSummaryTable(doc, er);

        // Remark below the table
        if (er.remark) {
          doc.font("Helvetica-Oblique").fontSize(12).text(`Remark: ${er.remark}`, {
            align: "center",
          });
        }
      }

      doc.moveDown(3);

      // --- Footer Signatures ---
      const bottom = doc.page.height - 150;
      doc.text("__________________", 60, bottom).text(
        "Class Teacher",
        70,
        bottom + 15
      );
      doc.text("__________________", 250, bottom).text(
        "Principal",
        280,
        bottom + 15
      );
      doc.text("__________________", 430, bottom).text(
        "Parent/Guardian",
        440,
        bottom + 15
      );

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

    const pdfBuffer = await generateStudentReport(student, exam, school);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${student.firstName}_${student.lastName}_Report.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Error generating report", error: err.message });
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
    res.status(500).json({
      msg: "Error generating class reports",
      error: err.message,
    });
  }
};

module.exports = {
  downloadStudentReport,
  downloadClassReports,
};
