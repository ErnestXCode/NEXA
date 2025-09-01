// controllers/parentController.js
const User = require("../../models/User");
const Student = require("../../models/Student");
const School = require("../../models/School");
const Activity = require("../../models/Activity");

const handleBulkParentRegister = async (req, res) => {
  const requester = req.user;
  const parents = req.body.parents; // array from frontend

  if (!Array.isArray(parents) || parents.length === 0) {
    return res.status(400).json({ msg: "No parent data provided" });
  }

  const createdParents = [];

  for (const p of parents) {
    const { name, email, password, phoneNumber, children = [] } = p;

    // Validate required fields
    if (!name || !email || !password || !phoneNumber) continue;

    // Skip if user already exists
    const exists = await User.findOne({ email });
    if (exists) continue;

    // Ensure the school exists
    const schoolDoc = await School.findById(requester.school);
    if (!schoolDoc) continue;

    // Filter children that actually exist in this school
    const validChildren = await Student.find({
      _id: { $in: children },
      school: requester.school,
    }).select("_id");

    const newParent = new User({
      name,
      email,
      password,
      phoneNumber,
      role: "parent",
      school: requester.school,
      children: validChildren.map(c => c._id),
    });

    await newParent.save();

    // Log activity
    const log = new Activity({
      type: "parent",
      description: `New parent ${name} registered via bulk upload`,
      createdBy: requester._id,
      school: requester.school,
    });
    await log.save();

    createdParents.push({ name, email, children: validChildren.map(c => c._id) });
  }

  res.status(201).json({
    msg: "Bulk parent upload completed",
    createdCount: createdParents.length,
    parents: createdParents,
  });
};

module.exports = handleBulkParentRegister;
