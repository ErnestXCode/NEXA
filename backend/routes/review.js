const express = require("express");
const { getAllReviews, addReview } = require("../controllers/review/reviewController");
const verifyJWT = require("../middleware/verifyJWT");
const router = express.Router();

// Public: get reviews
router.get("/", getAllReviews);

// Optional: authenticated users can submit reviews
router.post("/", verifyJWT, addReview);

module.exports = router;
