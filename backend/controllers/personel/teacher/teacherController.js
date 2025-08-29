const mongoose = require('mongoose')
const User = require("../../../models/User");

const getTeacherById = async (req, res) => {
  const { id } = req.params;
  const foundTeacher = await User.findById(new mongoose.Types.ObjectId(id));
  if (!foundTeacher) return res.status(404).json({ msg: "teacher not found" });
  res.status(200).json(foundTeacher);
};
const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const content = req.body;
  const foundTeacher = await User.findByIdAndUpdate(
    new mongoose.Types.ObjectId(id),
    content,
    { new: true }
  );
  if (!foundTeacher) return res.status(404).json({ msg: "teacher not found" });
  res.status(200).json({ msg: "updated teacher successfully" });
};
const deleteTeacher = async (req, res) => {
  const { id } = req.params;
  const foundTeacher = await User.findByIdAndDelete(
    new mongoose.Types.ObjectId(id)
  );
  if (!foundTeacher) return res.status(404).json({ msg: "teacher not found" });
  res.status(200).json({ msg: "deleted teacher successfully" });
};

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" });
    if (!teachers) return res.sendStatus(500);
    res.status(200).json(teachers);
  } catch (error) {
    return res.sendStatus(500);
  }
};
module.exports = {
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getAllTeachers,
};
