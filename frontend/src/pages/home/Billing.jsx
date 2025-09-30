import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const plans = [
  {
    plan: "Starter",
    price: 1,
    features: [
      "Up to 100 students",
      "Basic exam reports",
      "Attendance tracking",
      "Email support",
    ],
  },
  {
    plan: "Professional",
    price: 50000,
    features: [
      "Up to 500 students",
      "Detailed reports",
      "Fees management",
      "Priority support",
    ],
    highlight: true,
  },
  {
    plan: "Enterprise",
    price: 0,
    features: [
      "Unlimited students",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

const Billing = () => {
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [mpesaCode, setMpesaCode] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  // Fetch logged-in school
  const { data, isLoading, isError } = useQuery({
    queryKey: ["school", "me"],
    queryFn: async () => {
      const res = await api.get("/schools/me");
      return res.data;
    },
  });

  useEffect(() => {
    if (data) setSchool(data);
  }, [data]);

  const handleManualPayment = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const submitManualPayment = async () => {
    try {
      const res = await api.post("/manual-payments/submit", {
        plan: selectedPlan.plan,
        amount: selectedPlan.price,
        mpesaCode,
        proofUrl,
      });
      alert(res.data.msg);
      setShowModal(false);
      setMpesaCode("");
      setProofUrl("");
    } catch (err) {
      alert("Error submitting proof");
    }
  };

  if (isLoading) return <p className="text-white p-6">Loading...</p>;
  if (isError)
    return <p className="text-red-500 p-6">Error fetching school info</p>;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-24 px-6">
      <h1 className="text-4xl font-bold text-center mb-12">Billing Plans</h1>

      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`p-8 rounded-2xl border shadow transition-transform transform hover:scale-105 ${
              p.highlight
                ? "bg-gray-900 border-gray-700 shadow-lg"
                : "bg-gray-900 border-gray-800"
            }`}
          >
            <h3 className="text-2xl font-semibold text-white mb-4">{p.plan}</h3>
            <p className="text-4xl font-bold text-white mb-6">
              {p.price > 0 ? `KES ${p.price}` : "Custom"}
            </p>
            <ul className="space-y-3 text-gray-400 mb-6">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>

            {/* Starter plan → allow proof upload */}
            {p.plan === "Starter" ? (
              <button
                onClick={() => handleManualPayment(p)}
                className="w-full px-5 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600"
              >
                Upload M-Pesa Proof
              </button>
            ) : (
              <button
                disabled
                className="w-full px-5 py-2 bg-gray-700 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}

            {/* Pesapal disabled globally */}
            <button
              disabled
              className="w-full mt-3 px-5 py-2 bg-gray-700 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
            >
              Pay with Pesapal (Disabled)
            </button>
          </div>
        ))}
      </section>

      {/* Modal */}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Submit Proof of Payment</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-300">
                  M-Pesa Transaction Code
                </label>
                <input
                  type="text"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={submitManualPayment}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Billing;
