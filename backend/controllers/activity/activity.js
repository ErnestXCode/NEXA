const Activity = require("../../models/Activity");

const getActivities = async (req, res) => {
  try {
    const requester = req.user;
    const query = requester.role === "superadmin" ? {} : { school: requester.school };
    const activities = await Activity.find(query).sort({ date: -1 }).limit(10);
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching activities", error: err.message });
  }
}


module.exports = getActivities