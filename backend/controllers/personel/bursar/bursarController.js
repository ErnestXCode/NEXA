const mongoose = require("mongoose");
const User = require("../../../models/User");

// Get bursar by ID
const getBursarById = async (req, res) => {
  try {
    const { id } = req.params;
    const bursar = await User.findById(id);
    if (!bursar || bursar.role !== "bursar") return res.status(404).json({ msg: "Bursar not found" });
    res.status(200).json(bursar);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching bursar", error: err.message });
  }
};

// Update bursar
const updateBursar = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Bursar not found" });
    res.status(200).json({ msg: "Bursar updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating bursar", error: err.message });
  }
};

// Delete bursar
const deleteBursar = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "Bursar not found" });
    res.status(200).json({ msg: "Bursar deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting bursar", error: err.message });
  }
};

// Get all bursars (filtered by school if not superadmin)
const getAllBursars = async (req, res) => {
  try {
    const requester = req.user;

    let query = { role: "bursar" };

    if(requester.role !== 'admin' && requester.role !=='superadmin'){
      return res.status(403).json({msg: 'Unauthorized'})
    }

    if (requester.role === "admin") {
      query.school = requester.school; // school-specific bursars
    }

    // superadmin sees all bursars
    const bursars = await User.find(query);
    res.status(200).json(bursars);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching bursars", error: err.message });
  }
};


module.exports = {
  getBursarById,
  updateBursar,
  deleteBursar,
  getAllBursars,
};
