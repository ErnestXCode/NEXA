import React, { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import api from "../../api/axios";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    name: "",
    message: "",
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/reviews");
        setReviews(res.data.reviews);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (value) => {
    setForm((prev) => ({ ...prev, rating: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.message) return alert("Name and message are required");

    setSubmitting(true);
    try {
      await api.post("/reviews", form);
      alert("Review submitted successfully!");
      setReviews((prev) => [form, ...prev]); // prepend new review
      setForm({ name: "", message: "", rating: 5 });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-950 text-gray-100 rounded-2xl shadow-lg space-y-10">
      {/* Form */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Submit a Review</h2>
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
          />
          <textarea
            name="message"
            placeholder="Your Review"
            rows="5"
            value={form.message}
            onChange={handleChange}
            required
            className="p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
          />
          <div className="flex items-center space-x-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-8 h-8 cursor-pointer ${
                    i < form.rating ? "text-yellow-400" : "text-gray-600"
                  }`}
                  onClick={() => handleRating(i + 1)}
                />
              ))}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Display Reviews */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">User Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center">No reviews yet. Be the first to submit one!</p>
        ) : (
          reviews.map((r, i) => (
            <div
              key={i}
              className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3">
                {r.avatar && (
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <p className="font-semibold text-white">{r.name}</p>
                <div className="flex ml-auto space-x-1">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <StarIcon
                        key={idx}
                        className={`w-5 h-5 ${
                          idx < r.rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                </div>
              </div>
              <p className="text-gray-300 italic">“{r.message}”</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
