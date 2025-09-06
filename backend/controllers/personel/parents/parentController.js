const mongoose = require("mongoose");
const User = require("../../../models/User");

// Get parent by ID
const getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await User.findById(id).populate({
      path: "children",
      select: "firstName lastName classLevel admissionNumber",
    });
    console.log(parent)

    if (!parent || parent.role !== "parent")
      return res.status(404).json({ msg: "Parent not found" });
    res.status(200).json(parent);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching parent", error: err.message });
  }
};

// Update parent
const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Parent not found" });
    res
      .status(200)
      .json({ msg: "Parent updated successfully", parent: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating parent", error: err.message });
  }
};

// Delete parent
const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "Parent not found" });
    res.status(200).json({ msg: "Parent deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting parent", error: err.message });
  }
};

// Get all parents (filtered by school if not superadmin)
const getAllParents = async (req, res) => {
  try {
    const requester = req.user;

    let query = { role: "parent" };

    if (requester.role === "admin") {
      query.school = requester.school; // school-specific parents
    }

    // superadmin sees all parents
    const parents = await User.find(query).populate({
      path: "children",
      select: "firstName lastName classLevel admissionNumber",
    });
    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching parents", error: err.message });
  }
};

module.exports = {
  getParentById,
  updateParent,
  deleteParent,
  getAllParents,
};
