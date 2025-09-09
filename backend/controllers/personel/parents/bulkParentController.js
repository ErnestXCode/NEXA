const bcrypt = require("bcrypt");
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

    for (let p of parents) {
      // Skip if missing required fields
      if (!p.name || !p.email || !p.password || !p.phoneNumber) continue;

      
      // Ensure children IDs exist
      let children = [];
      if (p.children && Array.isArray(p.children) && p.children.length > 0) {
        const validChildren = await Student.find({ _id: { $in: p.children } });
        children = validChildren.map((s) => s._id);
      }

      console.log('children', children)

      const parent = new User({
        name: p.name,
        email: p.email,
        password: p.password,
        phoneNumber: p.phoneNumber,
        school: requester.school,
        role: "parent",
        children,
      });

      await parent.save();

      // 🔄 Update guardian field for each child
      if (children.length > 0) {
        await Promise.all(
          children.map(async (studentId) => {
            const student = await Student.findById(studentId);
            if (student) {
              console.log('student', student)
              student.guardian = parent._id;
              await student.save();
            }
          })
        );
      }

      createdParents.push(parent);
    }

    res.status(201).json({ msg: "Bulk parents created", createdParents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
