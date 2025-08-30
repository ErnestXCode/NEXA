const mongoose = require("mongoose");

const schoolSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  //   map_url: {
  //     type: String,
  //     required: true
  //   }
});

const School = mongoose.model("School", schoolSchema);
module.exports = School;


// const mongoose = require("mongoose");

// const schoolSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   address: { type: String },
//   phone: { type: String },
//   email: { type: String },
//   modules: {
//     exams: { type: Boolean, default: true },
//     attendance: { type: Boolean, default: true },
//     feeTracking: { type: Boolean, default: true },
//   },
// }, { timestamps: true });

// module.exports = mongoose.model("School", schoolSchema);
