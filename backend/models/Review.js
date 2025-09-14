const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String }, // optional, could be a URL
    school: { type: String },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 }, // optional
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
