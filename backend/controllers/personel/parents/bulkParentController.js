const Student = require("../../../models/Student");
const User = require("../../../models/User");

exports.bulkCreateParents = async (req, res) => {
  try {
    const { parents } = req.body;
    const requester = req.user;

    if (!parents || !Array.isArray(parents)) {
      return res.status(400).json({ msg: "Invalid parents data" });
    }

    const createdParents = [];
    const skippedParents = [];

    for (let p of parents) {
      // Skip if missing required fields
      if (!p.name || !p.email || !p.password || !p.phoneNumber) {
        skippedParents.push({ ...p, reason: "Missing required fields" });
        continue;
      }

      // 🔹 Enforce password policy
      if (p.password.length < 6) {
        skippedParents.push({ ...p, reason: "Password too short" });
        continue;
      }

      // 🔹 Prevent duplicate parents
      const duplicate = await User.findOne({
        $or: [{ email: p.email }, { phoneNumber: p.phoneNumber }],
      });
      if (duplicate) {
        skippedParents.push({ ...p, reason: "Email/phone already exists" });
        continue;
      }

      // 🔹 Ensure children belong to same school
      let children = [];
      if (p.children && Array.isArray(p.children) && p.children.length > 0) {
        const validChildren = await Student.find({
          _id: { $in: p.children },
          school: requester.school,
        });
        children = validChildren.map((s) => s._id);
      }

      // Create parent (password will be hashed by pre-save hook)
      const parent = new User({
        name: p.name.trim(),
        email: p.email.trim(),
        phoneNumber: p.phoneNumber.trim(),
        password: p.password,
        role: "parent",
        school: requester.school,
        children,
      });

      await parent.save();

      // 🔹 Update each student's guardian only if none exists
      if (children.length > 0) {
        await Promise.all(
          children.map(async (studentId) => {
            const student = await Student.findById(studentId);
            if (student) {
              if (!student.guardian) {
                student.guardian = parent._id;
                await student.save();
              }
              // 👉 if student.guardian already set, we skip to avoid overwrite
            }
          })
        );
      }

      createdParents.push(parent);
    }

    res.status(201).json({
      msg: "Bulk parents processed",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
