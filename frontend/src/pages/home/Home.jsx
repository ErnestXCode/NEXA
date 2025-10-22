import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LightBulbIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import api from "../../api/axios";

const Home = () => {
  const features = [
    {
      title: "Easy to Use",
      text: "An intuitive interface designed to make your experience seamless and enjoyable.",
      icon: LightBulbIcon,
      color: "text-yellow-400",
    },
    {
      title: "Powerful Tools",
      text: "Packed with features that empower you to get more done with fewer clicks.",
      icon: Cog6ToothIcon,
      color: "text-cyan-400",
    },
    {
      title: "Secure & Reliable",
      text: "Built with security in mind, ensuring your data is always safe and accessible.",
      icon: ShieldCheckIcon,
      color: "text-green-400",
    },
  ];

  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/reviews");
        setTestimonials(res.data.reviews);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-950 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Nexa</h1>

        <ul className="hidden md:flex gap-8 text-gray-400">
          <NavLink to="/" className="hover:text-white transition-colors">
            Home
          </NavLink>
          <NavLink
            to="/features"
            className="hover:text-white transition-colors"
          >
            Features
          </NavLink>
          <NavLink to="/pricing" className="hover:text-white transition-colors">
            Pricing
          </NavLink>
          <NavLink to="/contact" className="hover:text-white transition-colors">
            Contact
          </NavLink>
        </ul>

        <Link
          to="/register"
          className="px-5 py-2 bg-white font-semibold text-black rounded-xl hover:bg-gray-200 transition-colors"
        >
          Sign Up
        </Link>
      </nav>

      {/* Hero Section */}
      {/* Hero Section */}
<section className="relative flex flex-col items-center justify-center text-center min-h-[90vh] px-4 overflow-hidden">
  {/* Background image */}
  <div className="absolute inset-0">
    <img
      src="/images/dashboardHero.png"
      alt="Dashboard Background"
      className="w-full h-full object-cover opacity-50"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 to-gray-950/85" />
  </div>

  {/* Content */}
  <div className="relative z-10 max-w-3xl px-4">
    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight drop-shadow-xl">
      Welcome to Nexa
    </h1>
    <p className="text-lg md:text-xl max-w-2xl mb-10 text-gray-200 mx-auto">
      Nexa is the next-generation platform that simplifies your workflow,
      connects your team, and helps you focus on what truly matters.
    </p>
    <Link
      to="/register"
      className="px-8 py-3 bg-white text-black font-semibold rounded-xl shadow hover:bg-gray-200 transition-transform transform hover:scale-105"
    >
      Get Started
    </Link>

    <div className="flex flex-row gap-6 mt-8 md:hidden justify-center">
      <NavLink to="/" className="text-gray-300 hover:text-white text-sm">
        Home
      </NavLink>
      <NavLink to="/features" className="text-gray-300 hover:text-white text-sm">
        Features
      </NavLink>
      <NavLink to="/pricing" className="text-gray-300 hover:text-white text-sm">
        Pricing
      </NavLink>
      <NavLink to="/contact" className="text-gray-300 hover:text-white text-sm">
        Contact
      </NavLink>
    </div>
  </div>
</section>


      {/* App Modules Preview */}
      <section className="py-24 bg-gray-950 px-6 border-t border-gray-800 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-14 text-white">
            Explore What Nexa Can Do
          </h2>

          <FeatureSlider />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-950 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-14 text-white">
            Why Choose Nexa?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-8 bg-gray-900 rounded-2xl shadow border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gray-800 shadow-inner">
                    <Icon className={`w-10 h-10 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-900 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-14 text-white">
            What Our Users Say
          </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
  {testimonials.length > 0 ? (
    testimonials.map((t, i) => (
      <div
        key={i}
        className="p-8 border border-gray-800 rounded-2xl shadow bg-gray-950 hover:border-gray-700 transition-colors"
      >
        {t.avatar && (
          <img
            src={t.avatar}
            alt={t.name}
            className="w-16 h-16 rounded-full mx-auto mb-5 object-cover"
          />
        )}
        <p className="italic mb-3 text-gray-300">“{t.message}”</p>
        <p className="font-semibold text-white">
          — {t.name}, {t.school}
        </p>
        {t.rating && <p className="text-yellow-400 mt-2">⭐ {t.rating}</p>}
      </div>
    ))
  ) : (
    <p className="text-gray-400 text-lg col-span-full">
      No reviews yet — be the first to share your experience!
    </p>
  )}
</div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-950 text-white text-center px-6">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Ready to get started?
        </h2>
        <p className="mb-10 text-gray-400">
          Join the growing community of schools using Nexa.
        </p>
        <Link
          to="/register"
          className="px-8 py-3 bg-white text-black font-semibold rounded-xl shadow hover:bg-gray-200 transition-transform transform hover:scale-105"
        >
          Create Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-500 text-center border-t border-gray-800">
        <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;

const FeatureSlider = () => {
  const features = [
    {
      title: "School Broadcast",
      desc: "Instantly reach parents, teachers, and staff with announcements and updates — all from one platform.",
      img: "/images/broadCastModule.png",
    },
    {
      title: "Attendance & Trends",
      desc: "Easily record daily attendance and visualize trends across classes and terms.",
      img: "/images/attendanceModule.png",
    },
    {
      title: "Exams & Report Cards",
      desc: "Record exams, track performance, and automatically generate detailed report cards.",
      img: "/images/ExamModule.png",
    },
    {
      title: "Fees & Analytics",
      desc: "Record and manage school fees, monitor balances, and gain insights through smart analytics.",
      img: "/images/feesModule.png",
    },
    {
      title: "Parent Dashboard",
      desc: "Parents can view fee balances, attendance, report cards, and school updates — all in one clear dashboard.",
      img: "/images/parentViewNexa.png",
    },
    {
      title: "Teacher Dashboard",
      desc: "Teachers manage classes, record attendance and exams, communicate with parents, and monitor performance trends.",
      img: "/images/teacherViewNexa.png",
    },
    {
      title: "Bursar Dashboard",
      desc: "Track all financial activities — from payments to analytics — with a secure and organized bursar view.",
      img: "/images/bursarViewNexa.png",
    },
  ];

  const [index, setIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(window.innerWidth < 768 ? 1 : 3);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const handleResize = () => setItemsPerView(window.innerWidth < 768 ? 1 : 3);
    window.addEventListener("resize", handleResize);
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % features.length), 4000);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, [features.length]);

  const visible = [];
  for (let i = 0; i < itemsPerView; i++) {
    visible.push(features[(index + i) % features.length]);
  }

  return (
    <>
      <div className="relative flex items-center justify-center w-full overflow-visible">
        {/* Left Arrow */}
        <button
          onClick={() => setIndex((prev) => (prev - 1 + features.length) % features.length)}
          className="hidden md:flex absolute -left-12 xl:-left-20 p-4 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-full text-white text-3xl shadow-lg transition-transform hover:scale-110 z-10"
        >
          ‹
        </button>

        {/* Slider */}
        <div className="flex justify-center gap-12 w-full max-w-7xl transition-transform duration-700 ease-out px-4 md:px-0">
          {visible.map((f, i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-gray-900 p-7 rounded-2xl border border-gray-800 hover:border-gray-700 shadow-lg transition-transform transform hover:scale-[1.05] cursor-pointer"
              style={{
                width: itemsPerView === 1 ? "90%" : "35%",
              }}
              onClick={() => setSelectedImage(f.img)}
            >
              <img
                src={f.img}
                alt={f.title}
                className="w-full h-60 object-cover rounded-xl mb-6 shadow-inner"
              />
              <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => setIndex((prev) => (prev + 1) % features.length)}
          className="hidden md:flex absolute -right-12 xl:-right-20 p-4 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-full text-white text-3xl shadow-lg transition-transform hover:scale-110 z-10"
        >
          ›
        </button>

        {/* Dots */}
        <div className="flex justify-center mt-10 gap-2 absolute bottom-[-3rem] left-1/2 -translate-x-1/2">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === index ? "bg-white scale-110" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Modal for Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[85vh] flex justify-center">
            <img
              src={selectedImage}
              alt="Feature Preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-gray-700"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white text-2xl rounded-full p-2 transition-transform hover:scale-110"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};


