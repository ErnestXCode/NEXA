const Review = require("../../models/Review");

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
    const { name, message, rating, avatar } = req.body;
    if (!name || !message) return res.status(400).json({ message: "Name and message required" });

    const review = new Review({
      name,
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
