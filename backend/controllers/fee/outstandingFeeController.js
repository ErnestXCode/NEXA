const Fee = require("../../models/Fee");
const Student = require("../../models/Student");

const getOutstandingFees = async (req, res) => {
  try {
    const { term, classLevel } = req.query;
    const schoolQuery = req.user.role === "superadmin" ? {} : { school: req.user.school };

    let query = { ...schoolQuery };
    if (term) query.term = term;
    if (classLevel) query.classLevel = classLevel;

    const students = await Student.find(query);
    const totalOutstanding = students.reduce((sum, s) => sum + s.feeBalance, 0);

    res.status(200).json({ totalOutstanding });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching outstanding fees", error: err.message });
  }
};



module.exports = getOutstandingFees;
