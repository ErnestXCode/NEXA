// controllers/schoolController.js

const School = require("../../models/School");

const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find({}, "_id name"); // only id and name
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch schools" });
  }
};

module.exports = { getAllSchools };
