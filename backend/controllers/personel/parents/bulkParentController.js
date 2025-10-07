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

    // 🔹 Collect all emails + phones to check duplicates in one query
    const emails = parents.map((p) => p.email).filter(Boolean);
    const phones = parents.map((p) => p.phoneNumber).filter(Boolean);

    const existingUsers = await User.find({
      $or: [{ email: { $in: emails } }, { phoneNumber: { $in: phones } }],
    }).select("email phoneNumber");

    const existingEmails = new Set(existingUsers.map((u) => u.email));
    const existingPhones = new Set(existingUsers.map((u) => u.phoneNumber));

    // 🔹 Collect all child IDs to validate in one go
    const allChildIds = [
      ...new Set(
        parents.flatMap((p) =>
          Array.isArray(p.children) ? p.children : []
        )
      ),
    ];

    const validChildren = await Student.find({
      _id: { $in: allChildIds },
      school: requester.school,
    }).select("_id guardian");

    const validChildMap = new Map(validChildren.map((s) => [s._id.toString(), s]));

    // 🔹 Process parents in parallel (bounded for safety)
    await Promise.all(
      parents.map(async (p) => {
        if (!p.name || !p.email || !p.password || !p.phoneNumber) {
          skippedParents.push({ ...p, reason: "Missing required fields" });
          return;
        }

        if (p.password.length < 6) {
          skippedParents.push({ ...p, reason: "Password too short" });
          return;
        }

        if (existingEmails.has(p.email) || existingPhones.has(p.phoneNumber)) {
          skippedParents.push({ ...p, reason: "Email/phone already exists" });
          return;
        }

        // Filter children belonging to this school
        const children = (Array.isArray(p.children) ? p.children : [])
          .filter((id) => validChildMap.has(id))
          .map((id) => id);

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
        createdParents.push(parent);

        // 🔹 Bulk update children without overwriting existing guardians
        if (children.length > 0) {
          const unassigned = children.filter(
            (id) => !validChildMap.get(id).guardian
          );
          if (unassigned.length > 0) {
            await Student.updateMany(
              { _id: { $in: unassigned } },
              { $set: { guardian: parent._id } }
            );
            // update cached map to avoid duplicates in next iterations
            unassigned.forEach((id) => {
              validChildMap.get(id).guardian = parent._id;
            });
          }
        }
      })
    );

    res.status(201).json({
      msg: "Bulk parents processed",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
