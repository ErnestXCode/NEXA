// File: /services/exportService.js
// Purpose: Collect all school-related data and create a ZIP file for download

const School = require("../models/School");
const Student = require("../models/Student");
const User = require("../models/User");
const Exam = require("../models/Exam");
const FeeTransaction = require("../models/FeeTransaction");
const Attendance = require("../models/Attendance");

const { Parser } = require("json2csv");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

/**
 * Gather all school-related data
 */
async function exportSchoolData(schoolId) {
    const school = await School.findById(schoolId);
    const students = await Student.find({ school: schoolId });
    const users = await User.find({ school: schoolId });
    const exams = await Exam.find({ school: schoolId });
    const fees = await FeeTransaction.find({ school: schoolId });
    const attendance = await Attendance.find({ school: schoolId });

    return { school, students, users, exams, fees, attendance };
}

/**
 * Convert data to JSON/CSV and create ZIP file
 */
// async function createExportFile(data, outputPath) {
//     const archive = archiver("zip", { zlib: { level: 9 } });
//     const output = fs.createWriteStream(outputPath);
//     archive.pipe(output);

//     // JSON files
//     archive.append(JSON.stringify(data.school, null, 2), { name: "school.json" });

//     // CSV files
//     const csvFields = ["students", "users", "exams", "fees", "attendance"];
//     const csvParser = new Parser();

//     csvFields.forEach(field => {
//         if (data[field] && data[field].length > 0) {
//             archive.append(csvParser.parse(data[field]), { name: `${field}.csv` });
//         }
//     });

//     await archive.finalize();
// }
async function createExportFile(data, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const archive = archiver("zip", { zlib: { level: 9 } });
  const output = fs.createWriteStream(outputPath);

  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);

    // 1️⃣ School metadata as JSON
    archive.append(JSON.stringify(data.school, null, 2), { name: "school.json" });

    // 2️⃣ Other entities as CSV
    appendCSV(archive, data.students, "students");
    appendCSV(archive, data.users, "users");
    appendCSV(archive, data.exams, "exams");
    appendCSV(archive, data.fees, "fees");
    appendCSV(archive, data.attendance, "attendance");

    archive.finalize();
  });
}
// async function createExportFile(data, outputPath) {
//   const dir = path.dirname(outputPath);
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

//   const workbook = new ExcelJS.Workbook();

//   // 1️⃣ School info as a sheet
//   const schoolSheet = workbook.addWorksheet("School Info");
//   Object.entries(data.school).forEach(([key, value], i) => {
//     schoolSheet.addRow([key, JSON.stringify(value)]);
//   });

//   // 2️⃣ Students
//   if (data.students && data.students.length) {
//     const studentSheet = workbook.addWorksheet("Students");
//     studentSheet.columns = Object.keys(data.students[0]).map((key) => ({ header: key, key }));
//     data.students.forEach((s) => studentSheet.addRow(s));
//   }

//   // 3️⃣ Users
//   if (data.users && data.users.length) {
//     const userSheet = workbook.addWorksheet("Users");
//     userSheet.columns = Object.keys(data.users[0]).map((key) => ({ header: key, key }));
//     data.users.forEach((u) => userSheet.addRow(u));
//   }

//   // 4️⃣ Exams
//   if (data.exams && data.exams.length) {
//     const examSheet = workbook.addWorksheet("Exams");
//     examSheet.columns = Object.keys(data.exams[0]).map((key) => ({ header: key, key }));
//     data.exams.forEach((e) => examSheet.addRow(e));
//   }

//   // 5️⃣ Fees
//   if (data.fees && data.fees.length) {
//     const feeSheet = workbook.addWorksheet("Fees");
//     feeSheet.columns = Object.keys(data.fees[0]).map((key) => ({ header: key, key }));
//     data.fees.forEach((f) => feeSheet.addRow(f));
//   }

//   // 6️⃣ Optional: Attendance
//   if (data.attendance && data.attendance.length) {
//     const attSheet = workbook.addWorksheet("Attendance");
//     attSheet.columns = Object.keys(data.attendance[0]).map((key) => ({ header: key, key }));
//     data.attendance.forEach((a) => attSheet.addRow(a));
//   }

//   await workbook.xlsx.writeFile(outputPath);
// }
// helper function
function appendCSV(archive, dataArray, name) {
  if (!dataArray || !dataArray.length) return;
  const parser = new Parser();
  archive.append(parser.parse(dataArray), { name: `${name}.csv` });
}

module.exports = { exportSchoolData, createExportFile };
