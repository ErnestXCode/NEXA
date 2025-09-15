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
  let y = doc.y + 10;
 const colWidths = [160, 70, 120, 175]; // total = 515
// Subject, Marks, Performance Level, Remark

  // --- Table headers
  doc.font("Helvetica-Bold").fontSize(12);
  const headers = ["Subject", "Marks", "Performance Level", "Remark"];

  let x = startX;
  headers.forEach((h, i) => {
    doc.rect(x, y, colWidths[i], 25).stroke();
    doc.text(h, x + 5, y + 7, { width: colWidths[i] - 10, align: "center" });
    x += colWidths[i];
  });
  y += 25;

  // --- Table rows
  doc.font("Helvetica").fontSize(11);

  er.subjects.forEach((s, i) => {
    const rowData = [
      s.name,
      s.score?.toString() || "-",
      s.grade || "-", // renamed
      s.remark || "",
    ];

    // Find max height needed for this row (based on wrapped text)
    const heights = rowData.map((text, j) =>
      doc.heightOfString(text, { width: colWidths[j] - 10 })
    );
    const rowHeight = Math.max(...heights, 25);

    // Alternate row background
    if (i % 2 === 0) {
      doc
        .rect(
          startX,
          y,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .fill("#f2f2f2")
        .stroke();
      doc.fillColor("black");
    } else {
      doc
        .rect(
          startX,
          y,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .stroke();
    }

    // Draw text in each column
    let colX = startX;
    rowData.forEach((text, j) => {
      doc.text(text, colX + 5, y + 5, {
        width: colWidths[j] - 10,
        align: j === 1 || j === 2 ? "center" : "left", // center Marks + Performance Level
      });
      colX += colWidths[j];
    });

    y += rowHeight;
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
  const colWidths = [80, 80]; // Total, Average, Grade

  // Headers
  doc.font("Helvetica-Bold").fontSize(12);
  let x = startX;
  const headers = ["Total Marks", "Average"];
  doc
    .rect(
      startX,
      startY,
      colWidths.reduce((a, b) => a + b, 0),
      rowHeight
    )
    .stroke();
  headers.forEach((h, i) => {
    doc.text(h, x + 5, startY + 8, {
      width: colWidths[i] - 10,
      align: "center",
    });
    x += colWidths[i];
  });

  // Values
  doc.font("Helvetica").fontSize(13);
  const values = [
    er.total?.toString() || "-",
    er.average?.toFixed(2) || "-",
  ];
  let y = startY + rowHeight;
  x = startX;
  doc
    .rect(
      startX,
      y,
      colWidths.reduce((a, b) => a + b, 0),
      rowHeight
    )
    .stroke();
  values.forEach((v, i) => {
    doc.text(v, x + 5, y + 8, { width: colWidths[i] - 10, align: "center" });
    x += colWidths[i];
  });

  doc.moveDown(3);
}

/**
 * Generate PDF for a single student
 */
async function generateStudentReport(student, exam, school, positionText) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks = [];
      doc.on("data", chunks.push.bind(chunks));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // --- Header ---
      const logoWidth = 60;
      if (school.logoUrl) {
        try {
          doc.image(school.logoUrl, 50, 30, { width: logoWidth });
        } catch (e) {
          console.warn("Logo not found:", e.message);
        }
      }

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(school.name || "School Name", 0, 35, { align: "center" });

      // Add address, phone, email if available
      doc.fontSize(10);
      if (school.address) doc.text(school.address, { align: "center" });
      if (school.phone) doc.text(`Tel: ${school.phone}`, { align: "center" });
      if (school.email) doc.text(`Email: ${school.email}`, { align: "center" });

      doc.moveDown(0.5);
      doc
        .strokeColor("#000")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(1);

      // --- Exam Title ---
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(`Exam Report: ${exam.name} (${exam.term})`, { align: "center" });
      doc.moveDown(1.5);

      // --- Student Details ---
      const studentInfo = [
        ["Name:", `${student.firstName} ${student.lastName}`],
        ["Admission No:", student.admissionNumber || "-"],
        ["Class:", student.classLevel],
        ["Stream:", student.stream || "-"],
        ["Exam Date:", new Date(exam.date).toDateString()],
        ["Position:", positionText || "-"], // 👈 new line
      ];

      const startX = 50;
      let startY = doc.y;
      const col1Width = 120;

      doc.font("Helvetica").fontSize(11);
      studentInfo.forEach(([label, value], i) => {
        const y = startY + i * 18;
        doc.font("Helvetica-Bold").text(label, startX, y);
        doc.font("Helvetica").text(value, startX + col1Width, y);
      });

      doc.moveDown(2);

      // --- Results Table ---
      const er = (student.examResults || []).find(
        (r) =>
          r.exam?.toString() === exam._id.toString() &&
          r.academicYear === exam.academicYear
      );

      if (!er) {
        doc
          .font("Helvetica-Oblique")
          .fillColor("red")
          .text("⚠ No results found for this exam.", { align: "center" });
      } else {
        doc
          .fillColor("black")
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Subjects & Scores", { underline: true, align: "left" });
        doc.moveDown(0.5);

        drawResultsTable(doc, er, school);

        // --- Totals Summary Table ---
        drawSummaryTable(doc, er);

        // Remark below the table in a shaded box
        if (er.remark) {
          doc.moveDown(0.5);
          const remarkY = doc.y;
          doc.rect(50, remarkY, 500, 25).fill("#e0f7fa").stroke();
          doc
            .fillColor("black")
            .font("Helvetica-Oblique")
            .fontSize(12)
            .text(`Remark: ${er.remark}`, 55, remarkY + 6);
          doc.moveDown(2);
        }
      }

      // --- Footer ---
      const bottom = doc.page.height - 120;
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`Generated on: ${new Date().toDateString()}`, 50, bottom - 20);

      doc
        .text("__________________", 60, bottom)
        .text("Class Teacher", 70, bottom + 15);
      doc
        .text("__________________", 250, bottom)
        .text("Principal", 280, bottom + 15);
      doc
        .text("__________________", 430, bottom)
        .text("Parent/Guardian", 440, bottom + 15);

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
    const { positionText } = req.body; // 👈 grab from frontend

    const student = await Student.findById(studentId);
    const exam = await Exam.findById(examId);
    const school = await School.findById(student.school);

    if (!student || !exam || !school) {
      return res.status(404).json({ msg: "Data not found" });
    }

    const pdfBuffer = await generateStudentReport(
      student,
      exam,
      school,
      positionText // 👈 pass into PDF generator
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${student.firstName}_${student.lastName}_Report.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Error generating report",
      error: err.message,
    });
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
