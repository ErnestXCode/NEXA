const mongoose = require("mongoose");
const User = require("../../../models/User");

const getBursarById = async (req, res) => {
  const { id } = req.params;
  const foundBursar = await User.findById(new mongoose.Types.ObjectId(id));
  if (!foundBursar) return res.status(404).json({ msg: "Bursar not found" });
  res.status(200).json(foundBursar);
};
const updateBursar = async (req, res) => {
  const { id } = req.params;
  const content = req.body;
  const foundBursar = await User.findByIdAndUpdate(
    new mongoose.Types.ObjectId(id),
    content,
    { new: true }
  );
  if (!foundBursar) return res.status(404).json({ msg: "Bursar not found" });
  res.status(200).json({ msg: "updated Bursar successfully" });
};
const deleteBursar = async (req, res) => {
  const { id } = req.params;
  const foundBursar = await User.findByIdAndDelete(
    new mongoose.Types.ObjectId(id)
  );
  if (!foundBursar) return res.status(404).json({ msg: "Bursar not found" });
  res.status(200).json({ msg: "deleted Bursar successfully" });
};

const getAllBursars = async (req, res) => {
  try {
    const bursars = await User.find({ role: "bursar" });
    if (!bursars) return res.sendStatus(500);
    res.status(200).json(bursars);
  } catch (error) {
    return res.sendStatus(500);
  }
};

module.exports = {
  getBursarById,
  updateBursar,
  deleteBursar,
  getAllBursars,
};
