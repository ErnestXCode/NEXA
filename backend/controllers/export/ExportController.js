const School = require("../../models/School");
const Student = require("../../models/Student");
const Exam = require("../../models/Exam");
const User = require("../../models/User");
const Fee = require("../../models/Fee");
const Attendance = require("../../models/Attendance");
const Attendance = require("../../models/Attendance");

async function exportSchoolData(schoolId) {
    const school = await School.findById(schoolId);
    const students = await Student.find({ school: schoolId });
    const users = await User.find({ school: schoolId });
    const exams = await Exam.find({ school: schoolId });
    const fees = await Fee.find({ school: schoolId });
    const attendance = await Attendance.find({ school: schoolId }); // optional

    return { school, students, users, exams, results, fees, attendance };
}
