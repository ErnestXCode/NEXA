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
