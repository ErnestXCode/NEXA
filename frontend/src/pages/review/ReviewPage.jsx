import React, { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import api from "../../api/axios";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    message: "",
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);

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
    if (!form.message) return alert("message is required");

    setSubmitting(true);
    try {
      const { data } = await api.post("/reviews", form);

      // mark the new review as local so UI knows it's fresh
      setReviews((prev) => [{ ...data.review, local: true }, ...prev]);

      setForm({ message: "", rating: 5 });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className=" bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Form Section */}
        <div className="bg-gradient-to-r from-purple-900 via-gray-900 to-gray-950 rounded-3xl p-8 shadow-lg border border-gray-800">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Share Your Experience
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              name="message"
              placeholder="Your Review"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 outline-none transition"
            />
            <div className="flex items-center space-x-2 justify-center">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-10 h-10 cursor-pointer transition-transform duration-200 hover:scale-125 ${
                      i < form.rating ? "text-yellow-400" : "text-gray-600"
                    }`}
                    onClick={() => handleRating(i + 1)}
                  />
                ))}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg transition-transform transform hover:scale-105 ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews Section */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center text-white">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center col-span-2">
                No reviews yet. Be the first to submit one!
              </p>
            ) : (
              reviews.map((r, i) => (
                <div
                  key={i}
                  className="p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {r.avatar && (
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <p className="font-semibold text-white">
                      {r.local ? "You just posted" : `${r.name}, ${r.school}`}
                    </p>

                    <div className="flex ml-auto space-x-1">
                      {Array(5)
                        .fill(0)
                        .map((_, idx) => (
                          <StarIcon
                            key={idx}
                            className={`w-5 h-5 ${
                              idx < r.rating
                                ? "text-yellow-400"
                                : "text-gray-600"
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
      </div>
    </div>
  );
};

export default ReviewPage;
