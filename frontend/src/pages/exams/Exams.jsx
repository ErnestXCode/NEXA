// src/pages/exams/Exams.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/exam"); // backend endpoint
        setExams(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, []);

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Exams</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/dashboard/exams/create")}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          + Create Exam
        </button>
        <button
          onClick={() => navigate("/dashboard/exams/record")}
          className="bg-blue-500 hover:bg-blue-600 p-2 rounded font-semibold ml-2"
        >
          Record Result
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Exam Name</th>
              <th className="py-3 px-4 text-left">Class</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Subject</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length > 0 ? (
              exams.map((exam, i) => (
                <tr
                  key={exam._id || i}
                  className={`${
                    i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                  } hover:bg-gray-800 transition`}
                >
                  <td className="py-2 px-4">{exam.name}</td>
                  <td className="py-2 px-4">{exam.classLevel}</td>
                  <td className="py-2 px-4">
                    {new Date(exam.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{exam.subject}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => navigate(`/dashboard/exams/${exam._id}`)}
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No exams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Exams;
