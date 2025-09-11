const mongoose = require("mongoose");
const School = require("./School");

const academicSessionSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  year: { type: Number, required: true },
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },

  // Copy school's classLevels (objects)
  classLevels: {
    type: [Object],
    default: async function () {
      const school = await School.findById(this.school);
      return school ? school.classLevels : [];
    },
  },

  // Keep subjects as simple array of strings
  subjects: {
    type: [String],
    default: async function () {
      const school = await School.findById(this.school);
      return school ? school.subjects : [];
    },
  },

  feeExpectations: {
    type: [Object],
    default: async function () {
      const school = await School.findById(this.school);
      return school ? school.feeExpectations : [];
    },
  },

  feeRules: {
    type: [Object],
    default: async function () {
      const school = await School.findById(this.school);
      return school ? school.feeRules : [];
    },
  },
}, { timestamps: true });

module.exports = mongoose.model("AcademicSession", academicSessionSchema);
