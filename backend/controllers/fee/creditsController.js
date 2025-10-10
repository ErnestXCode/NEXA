const StudentCredit = require("../../models/StudentCredit");

/* -------------------------------
   📋 Get All Credits (with filters)
--------------------------------*/
exports.getAllCredits = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const { academicYear, term, classLevel, page = 1, limit = 20 } = req.query;

    const query = { school: schoolId };

    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    // optional classLevel filter (via student reference)
    let creditsQuery = StudentCredit.find(query)
      .populate({
        path: "student",
        select: "firstName lastName classLevel",
        match: classLevel ? { classLevel } : {},
      })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const credits = await creditsQuery;
    const total = await StudentCredit.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({ credits, totalPages });
  } catch (err) {
    console.error("getAllCredits error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   ➕ Create Credit
--------------------------------*/
exports.createCredit = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const createdBy = req.user._id;
    const { student, academicYear, term, amount, source, note, appliedTo } =
      req.body;

    const credit = await StudentCredit.create({
      student,
      school: schoolId,
      academicYear,
      term,
      amount,
      source,
      note,
      appliedTo,
      createdBy,
    });

    res.status(201).json({ message: "Credit added successfully", credit });
  } catch (err) {
    console.error("createCredit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   ✏️ Update Credit
--------------------------------*/
exports.updateCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await StudentCredit.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Credit not found" });
    res.json({ message: "Credit updated", credit: updated });
  } catch (err) {
    console.error("updateCredit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   🗑️ Delete Credit
--------------------------------*/
exports.deleteCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StudentCredit.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Credit not found" });
    res.json({ message: "Credit deleted" });
  } catch (err) {
    console.error("deleteCredit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
