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
  const colWidths = [160, 70, 120, 175]; // total = 525
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  // --- Table headers
  doc.font("Helvetica-Bold").fontSize(12);
  const headers = ["Subject", "Marks", "Performance Level", "Remark"];

  let x = startX;
  // Table headers background
  headers.forEach((h, i) => {
    doc.rect(x, y, colWidths[i], 25).fillAndStroke("#bbdefb", "#0d47a1"); // soft blue fill
    doc
      .fillColor("#0d47a1")
      .font("Helvetica-Bold")
      .text(h, x + 5, y + 7, { width: colWidths[i] - 10, align: "center" });
    x += colWidths[i];
  });

  y += 25;

  // --- Table rows
  doc.font("Helvetica").fontSize(11);

  const rowTop = y;
  er.subjects.forEach((s, i) => {
    const rowData = [
      s.name,
      s.score?.toString() || "-",
      s.grade || "-",
      s.remark || "",
    ];

    const heights = rowData.map((text, j) =>
      doc.heightOfString(text, { width: colWidths[j] - 10 })
    );
    const rowHeight = Math.max(...heights, 25);

    // Alternate row background
    // Alternate row background
    if (i % 2 === 0) {
      doc.rect(startX, y, tableWidth, rowHeight).fill("#f1f8e9").stroke(); // light greenish
      doc.fillColor("black");
    } else {
      doc.rect(startX, y, tableWidth, rowHeight).stroke();
    }

    // Draw text in each column
    let colX = startX;
    rowData.forEach((text, j) => {
      const textHeight = doc.heightOfString(text, { width: colWidths[j] - 10 });
      const textY = y + (rowHeight - textHeight) / 2; // center vertically
      doc.text(text, colX + 5, textY, {
        width: colWidths[j] - 10,
        align: j === 1 || j === 2 ? "center" : "left",
      });
      colX += colWidths[j];
    });

    y += rowHeight;
  });

  // --- Draw continuous vertical lines for columns (✨ KEY ADDITION)
  let lineX = startX;
  doc.lineWidth(1).strokeColor("#000");
  for (let i = 0; i <= colWidths.length; i++) {
    const columnX = lineX;
    doc
      .moveTo(columnX, rowTop - 25) // start at header top
      .lineTo(columnX, y) // go to bottom of last row
      .stroke();
    lineX += colWidths[i] || 0;
  }

  // Draw bottom border line (to close the table neatly)
  doc
    .moveTo(startX, y)
    .lineTo(startX + tableWidth, y)
    .stroke();

  doc.moveDown(2);
}

/**
 * Draw summary table for totals, average, grade
 */
function drawSummaryTable(doc, er) {
  const startX = 50;
  const startY = doc.y;
  const rowHeight = 30;
  const colWidths = [120, 120]; // Total, Average (slightly wider for readability)
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  // --- Header ---
  doc.font("Helvetica-Bold").fontSize(12);
  let x = startX;
  const headers = ["Total Marks", "Average"];

  headers.forEach((h, i) => {
    // Light blue header background
    doc
      .rect(x, startY, colWidths[i], rowHeight)
      .fillAndStroke("#bbdefb", "#0d47a1");
    doc.fillColor("#0d47a1").text(h, x + 5, startY + 8, {
      width: colWidths[i] - 10,
      align: "center",
    });
    x += colWidths[i];
  });

  // --- Values ---
  const values = [er.total?.toString() || "-", er.average?.toFixed(2) || "-"];
  let y = startY + rowHeight;
  x = startX;
  values.forEach((v, i) => {
    // Subtle light grey background for value row
    doc.rect(x, y, colWidths[i], rowHeight).fillAndStroke("#f9f9f9", "#000");
    doc
      .fillColor("black")
      .text(v, x + 5, y + 8, { width: colWidths[i] - 10, align: "center" });
    x += colWidths[i];
  });

  // --- Bottom border for full table ---
  doc
    .moveTo(startX, y + rowHeight)
    .lineTo(startX + tableWidth, y + rowHeight)
    .stroke();

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
      // --- School Header (no outer box) ---
      const headerY = 30;

      // School logo on left
      if (school.logoUrl) {
        try {
          doc.image(school.logoUrl, 50, headerY, { width: 60, height: 60 });
        } catch (e) {
          console.warn("Logo not found:", e.message);
        }
      }

      // School name centered
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .text(school.name || "School Name", 0, headerY + 15, {
          width: 550,
          align: "center",
        });

      // Optional motto/tagline
      // Optional motto/tagline
      if (school.motto) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(10)
          .text(school.motto, 0, doc.y, { width: 550, align: "center" });
      }

      // Optional vision
      if (school.vision) {
        doc
          .moveDown(0.2) // small spacing
          .font("Helvetica-Oblique")
          .fontSize(10)
          .fillColor("#333333") // slightly darker grey
          .text(`Vision: ${school.vision}`, 0, doc.y, {
            width: 550,
            align: "center",
          });
      }

      // School contact details under name
      doc.font("Helvetica").fontSize(10);
      let contactText = [];
      if (school.address) contactText.push(school.address);
      if (school.phone) contactText.push(`Tel: ${school.phone}`);
      if (school.email) contactText.push(`Email: ${school.email}`);
      doc.text(contactText.join(" | "), 0, doc.y, {
        width: 550,
        align: "center",
      });

      // Horizontal line below school details
      doc.moveDown(0.5);
      doc
        .strokeColor("#000")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1);

      // --- Exam Info Box ---
      // Exam Info Box with color
      const examBoxHeight = 30;
      const examBoxY = doc.y;

      doc
        .roundedRect(50, examBoxY, 500, examBoxHeight, 5)
        .fillAndStroke("#e3f2fd", "#0d47a1"); // light blue fill with blue border

      doc
        .fillColor("#0d47a1")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`${exam.name} (${exam.term})`, 55, examBoxY + 8);

      doc
        .fillColor("black")
        .font("Helvetica")
        .fontSize(12)
        .text(`Date: ${new Date(exam.date).toDateString()}`, 400, examBoxY + 8);

      // --- Student Info Box ---
      // Calculate height dynamically
      // --- Student Info Box (prettier version) ---
      const studentInfo = [
        ["Name", `${student.firstName} ${student.lastName}`],
        ["Class", student.classLevel],
        ["Position", positionText || "-"],
      ];

      const rowHeight = 20;
      const studentBoxHeight = studentInfo.length * rowHeight + 16; // padding
      const studentBoxY = doc.y;

      // Rounded rectangle with background color
      doc
        .roundedRect(50, studentBoxY, 500, studentBoxHeight, 5)
        .fillAndStroke("#f9f9f9", "#000"); // light grey fill with black border

      let infoY = studentBoxY + 10;
      const col1X = 60;
      const col2X = 180;

      studentInfo.forEach(([label, value], i) => {
        // Draw horizontal separator for rows (except first row)
        if (i > 0) {
          doc
            .strokeColor("#d3d3d3")
            .lineWidth(0.5)
            .moveTo(50, infoY - 5)
            .lineTo(550, infoY - 5)
            .stroke();
        }

        // Label styling
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#0d47a1") // dark blue for labels
          .text(`${label}:`, col1X, infoY);

        // Value styling
        doc
          .font("Helvetica")
          .fontSize(11)
          .fillColor("black")
          .text(value, col2X, infoY);

        infoY += rowHeight;
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
          .text("Subjects & Scores", 50, doc.y, {
            width: 500, // content area = 550 - 50
            align: "center",
            underline: true,
          });

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

      // --- Footer (dynamic placement) ---
      doc.moveDown(2); // a bit of space after tables/remarks

      // Ensure footer starts on a new page if space is too tight
      if (doc.y > doc.page.height - 150) doc.addPage();

      const footerY = doc.y + 20;

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`Generated on: ${new Date().toDateString()}`, 50, footerY);

      doc
        .text("__________________", 60, footerY + 20)
        .text("Class Teacher", 70, footerY + 35);
      doc
        .text("__________________", 250, footerY + 20)
        .text("Principal", 280, footerY + 35);
      doc
        .text("__________________", 430, footerY + 20)
        .text("Parent/Guardian", 440, footerY + 35);

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
