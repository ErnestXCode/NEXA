const Term = require("../../models/Term");
const Student = require("../../models/Student");

// Create Term + class fees + populate students
const createTerm = async (req, res) => {
  try {
    const requester = req.user;
    const { name, startDate, endDate, classFees } = req.body;
    console.log(req.body)

    // Save term
    const term = new Term({
      name,
      startDate,
      endDate,
      school: requester.school,
      classFees,
    });
    await term.save();

    // Populate student feeExpectations
    for (const cf of classFees) {
      const students = await Student.find({ school: requester.school, classLevel: cf.classLevel });
      for (const student of students) {
        student.feeExpectations.push({ term: name, amount: cf.amount });
        student.feeBalance += cf.amount;
        await student.save();
      }
    }

    res.status(200).json({ msg: "Term created and students updated", term });
  } catch (err) {
    res.status(500).json({ msg: "Error creating term", error: err.message });
  }
};

module.exports = { createTerm };
