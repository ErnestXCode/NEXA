import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const plans = [
  {
    plan: "Starter",
    price: 1,
    pesapalAvailable: true,
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
    pesapalAvailable: false,
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
    pesapalAvailable: false,
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

  const handlePayment = async (plan, amount) => {
  if (!school?._id) {
    navigate("/login");
    return;
  }

  try {
    const res = await api.post("/pesapal/create-payment", {
      schoolId: school._id,
      plan,
      amount,
    });


    if (res.data.paymentUrl) window.open(res.data.paymentUrl, "_blank");
    else alert("Payment link generation failed");
  } catch (err) {
    console.error(err);
    alert("Error creating payment");
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
            {p.pesapalAvailable ? (
              <button
                onClick={() => handlePayment(p.plan, p.price)}
                className="w-full px-5 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Get Started
              </button>
            ) : (
              <button
                disabled
                className="w-full px-5 py-2 bg-gray-700 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>
        ))}
      </section>
    </main>
  );
};

export default Billing;
