const mongoose = require("mongoose");
const Student = require("../../models/Student");

const createStudent = async (req, res) => {
  const content = req.body;
  console.log(content)
  const requester = req.user;
  if (!content) return res.sendStatus(204);
  const newStudent = await new Student({
    ...content,
    school: requester.school,
  });
  const createdStudent = await newStudent.save();
  res.status(200).json(createdStudent);
};

const getStudentById = async (req, res) => {
  const { id } = req.params;
  const foundStudent = await Student.findById(new mongoose.Types.ObjectId(id));
  if (!foundStudent) return res.status(404).json({ msg: "student not found" });
  res.status(200).json(foundStudent);
};
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const content = req.body;
  const foundStudent = await Student.findByIdAndUpdate(
    new mongoose.Types.ObjectId(id),
    content,
    { new: true }
  );
  if (!foundStudent) return res.status(404).json({ msg: "student not found" });
  res.status(200).json({ msg: "updated student successfully" });
};
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  const foundStudent = await Student.findByIdAndDelete(
    new mongoose.Types.ObjectId(id)
  );
  if (!foundStudent) return res.status(404).json({ msg: "student not found" });
  res.status(200).json({ msg: "deleted student successfully" });
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    if (!students) return res.sendStatus(500);
    res.status(200).json(students);
  } catch (error) {
    return res.sendStatus(500);
  }
};

module.exports = {
  getStudentById,
  updateStudent,
  deleteStudent,
  getAllStudents,
  createStudent,
};
