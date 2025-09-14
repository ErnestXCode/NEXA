const Review = require("../../models/Review");
const User = require("../../models/User");

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a review (optional: only logged-in users)
const addReview = async (req, res) => {
  try {
    const { message, rating, avatar } = req.body;
    if (!message) return res.status(400).json({ message: "message required" });

    const reviewer = await User.findById(req.user.userId).populate({
      path: "school",
      select: "name",
    })

    const review = new Review({
      name: reviewer.name,
      school: reviewer.school.name,
      message,
      rating,
      avatar,
      createdBy: req.user?.userId, // if auth
    });

    await review.save();
    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllReviews, addReview };
