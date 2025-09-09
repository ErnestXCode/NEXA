// src/pages/exams/ReportCardsPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ReportCardsPage = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examId, setExamId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [results, setResults] = useState({});

  // colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#C71585"];

  // 🔹 Fetch exams & students
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/exams");
        setExams(res.data?.exams || res.data || []);
      } catch (err) {
        console.error("Failed to fetch exams", err);
      }
    };
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students");
        setStudents(res.data || []);
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };
    fetchExams();
    fetchStudents();
  }, []);

  // 🔹 Fetch subjects
  useEffect(() => {
    const fetchSubjectsForClass = async () => {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }
      try {
        const res = await api.get(
          `/schools/subjects/${encodeURIComponent(selectedClass)}`
        );
        setSubjects(res.data?.subjects || []);
      } catch (err) {
        console.error("Failed to fetch subjects for class", err);
        setSubjects([]);
      }
    };
    fetchSubjectsForClass();
  }, [selectedClass]);

  // 🔹 Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!examId || !selectedClass) return;
      try {
        const res = await api.get(
          `/exams/results/${examId}/${encodeURIComponent(selectedClass)}`
        );

        const mapped = {};
        (res.data || []).forEach((r) => {
          mapped[r.studentId] = {
            subjects: r.subjects || [],
            total: r.total,
            average: r.average,
            grade: r.grade,
            remark: r.remark,
          };
        });
        setResults(mapped);
      } catch (err) {
        console.error("Failed to fetch saved results", err);
      }
    };
    fetchResults();
  }, [examId, selectedClass]);

  const classLevels = [
    ...new Set(students.map((s) => s.classLevel || "Unassigned")),
  ];
  const filteredStudents = students.filter(
    (s) => selectedClass && s.classLevel === selectedClass
  );

  // ================= Charts Data =================

  // Student averages
  const studentAverages = filteredStudents.map((student) => {
    const r = results[student._id];
    const avg = r?.average ?? 0;
    return {
      name: `${student.firstName} ${student.lastName}`,
      average: avg,
    };
  });

  // Top 3 students
  const top3 = [...studentAverages]
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);

  // Best performed subjects (class average per subject)
  const subjectPerformance = subjects.map((subj) => {
    let total = 0;
    let count = 0;
    filteredStudents.forEach((student) => {
      const subjScore = results[student._id]?.subjects?.find(
        (s) => s.name === subj
      )?.score;
      if (subjScore != null) {
        total += subjScore;
        count++;
      }
    });
    return {
      subject: subj,
      average: count ? total / count : 0,
    };
  });

  // Grade distribution
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  filteredStudents.forEach((student) => {
    const grade = results[student._id]?.grade;
    if (grade) gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
  });
  const gradeData = Object.keys(gradeCounts).map((g) => ({
    name: g,
    value: gradeCounts[g],
  }));

  // ================= Actions =================
  const handleDownload = async (studentId) => {
    try {
      const res = await api.get(`/reports/student/${examId}/${studentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-card-${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handlePrintAll = async () => {
    if (!examId || !selectedClass) return;
    try {
      const res = await api.get(
        `/reports/class/${examId}/${encodeURIComponent(selectedClass)}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${selectedClass.replace(/\s+/g, "_")}_Reports.zip`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Bulk download failed", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Report Cards</h1>

      {/* Select Exam */}
      <select
        value={examId}
        onChange={(e) => {
          setExamId(e.target.value);
          setSelectedClass("");
          setResults({});
        }}
        className="p-2 w-full rounded bg-gray-800 text-white"
      >
        <option value="">Select Exam</option>
        {exams.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name} - {e.term}
          </option>
        ))}
      </select>

      {/* Select Class */}
      {examId && (
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setResults({});
          }}
          className="p-2 w-full rounded bg-gray-800 text-white"
        >
          <option value="">Select Class</option>
          {classLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      )}

      {/* Table */}
      {examId && selectedClass && (
        <>
          <div className="bg-gray-900 p-4 rounded-lg shadow overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedClass} — Report Cards
              </h2>
              <button
                onClick={handlePrintAll}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Download All (ZIP)
              </button>
            </div>

            <table className="min-w-full border border-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-2 text-left">Student</th>
                  {subjects.map((subj) => (
                    <th key={subj} className="p-2 text-left">
                      {subj}
                    </th>
                  ))}
                  <th className="p-2 text-left">Average</th>
                  <th className="p-2 text-left">Grade</th>
                  <th className="p-2 text-left">Remark</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const studentResult = results[student._id] || { subjects: [] };
                  const subjectsArr = studentResult.subjects || [];
                  const total = subjectsArr.reduce(
                    (acc, s) => acc + (s.score || 0),
                    0
                  );
                  const average = subjectsArr.length
                    ? total / subjectsArr.length
                    : 0;
                  const grade =
                    average >= 80
                      ? "A"
                      : average >= 70
                      ? "B"
                      : average >= 60
                      ? "C"
                      : average >= 50
                      ? "D"
                      : "E";

                  return (
                    <tr key={student._id} className="border-t border-gray-700">
                      <td className="p-2">
                        {student.firstName} {student.lastName}
                      </td>
                      {subjects.map((subj) => (
                        <td key={subj} className="p-2">
                          {subjectsArr.find((s) => s.name === subj)?.score ??
                            "-"}
                        </td>
                      ))}
                      <td className="p-2">{average.toFixed(1)}</td>
                      <td className="p-2">{grade}</td>
                      <td className="p-2">{studentResult.remark || "-"}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDownload(student._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Top 3 Students */}
            <div className="bg-gray-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Top 3 Students</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={top3}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Performance */}
            <div className="bg-gray-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">
                Best Performed Subjects
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectPerformance}>
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grade Distribution */}
            <div className="bg-gray-900 p-4 rounded-lg shadow col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {gradeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportCardsPage;
