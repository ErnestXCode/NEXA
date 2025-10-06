const User = require("../../models/User");
const School = require("../../models/School");
const Activity = require("../../models/Activity");

const handleBulkRegister = async (req, res) => {
  const requester = req.user;
  console.log("requester", requester);
  const personnel = req.body.personnel; // array from frontend

  if (!Array.isArray(personnel) || personnel.length === 0) {
    return res.status(400).json({ msg: "No personnel data provided" });
  }

  

  for (const p of personnel) {
    const { name, email, role, password, phoneNumber } = p;

    if (!name || !email || !role || !["teacher", "bursar"].includes(role)) {
      continue; // skip invalid rows
    }

    const exists = await User.findOne({ email });
    if (exists) continue;

    const schoolDoc = await School.findById(requester.school);
    if (!schoolDoc) continue;

    const newUser = new User({
      name,
      email,
      role,
      password,
      phoneNumber,
      school: requester.school,
    });

    if (role === "teacher") {
      newUser.subjects = p.subjects || [];
      newUser.isClassTeacher = p.isClassTeacher || false;
      newUser.classLevel = p.isClassTeacher ? p.classLevel || null : null;
    }

    await newUser.save();

    // Log activity
    const log = new Activity({
      type: "personel",
      description: `New personel ${name} registered via bulk upload`,
      createdBy: requester.userId,
      school: requester.school,
    });
    await log.save();

    
  }

  res.status(201).json({
    msg: "Bulk upload completed",
  });
};

module.exports = handleBulkRegister;
