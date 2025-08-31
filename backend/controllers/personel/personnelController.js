const User = require("../../models/User");

const getPersonnelById = async (req, res) => {
  try {
    const { id } = req.params;
    const personnel = await User.findById(id);
    if (!personnel) return res.status(404).json({ msg: "personnel not found" });
    res.status(200).json(personnel);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching personnel", error: err.message });
  }
};

const updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "personnel not found" });
    res
      .status(200)
      .json({ msg: "personnel updated successfully", personnel: updated });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error updating personnel", error: err.message });
  }
};

module.exports = { getPersonnelById, updatePersonnel };
