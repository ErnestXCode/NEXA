import React, { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import api from "../../api/axios";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ message: "", rating: 5 });
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

  const handleRating = (value) => setForm((prev) => ({ ...prev, rating: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message) return alert("Message is required");

    setSubmitting(true);
    try {
      const { data } = await api.post("/reviews", form);
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
    <div className="bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Form */}
        <div className="bg-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-800">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white">
            Share Your Experience
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                name="message"
                placeholder="Write your review..."
                rows="5"
                value={form.message}
                onChange={handleChange}
                required
                className="peer w-full p-5 rounded-2xl bg-gray-950 border border-gray-700 focus:border-blue-600 focus:ring focus:ring-blue-600/30 outline-none text-white placeholder-transparent transition"
              />
              <label className="absolute top-2 left-5 text-gray-400 text-sm peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base transition-all">
                Your Review
              </label>
            </div>

            <div className="flex items-center justify-center space-x-2">
              {Array(5).fill(0).map((_, i) => (
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
              className={`w-full py-3 md:py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg transition transform hover:scale-105 ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews */}
        <div className="space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center col-span-full">
                No reviews yet. Be the first to submit one!
              </p>
            ) : (
              reviews.map((r, i) => (
                <div
                  key={i}
                  className={`p-6 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 duration-300 ${
                    r.local ? "border-blue-600 ring-1 ring-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center mb-4 space-x-3">
                    {r.avatar && (
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-700"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {r.local ? "You just posted" : `${r.name}, ${r.school}`}
                      </p>
                      <div className="flex mt-1 space-x-1">
                        {Array(5).fill(0).map((_, idx) => (
                          <StarIcon
                            key={idx}
                            className={`w-5 h-5 ${idx < r.rating ? "text-yellow-400" : "text-gray-600"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 italic text-sm md:text-base">“{r.message}”</p>
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
