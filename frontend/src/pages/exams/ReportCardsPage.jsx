// src/pages/exams/ReportCardsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [examId, setExamId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [results, setResults] = useState({});

  // colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#C71585"];

  // 🔹 Fetch exams filtered by academicYear
  useEffect(() => {
    const fetchExams = async () => {
      if (!academicYear) return;
      try {
        const res = await api.get("/exams", { params: { academicYear } });
        setExams(res.data?.exams || res.data || []);
      } catch (err) {
        console.error("Failed to fetch exams", err);
      }
    };
    fetchExams();
  }, [academicYear]);

  // 🔹 Fetch students + subjects
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students/students-with-subjects");
        setStudents(res.data?.students || []);
        setSubjectsByClass(res.data?.subjectsByClass || {});
      } catch (err) {
        console.error("Failed to fetch students with subjects", err);
      }
    };
    fetchStudents();
  }, []);

  // 🔹 Update subjects for selected class
  useEffect(() => {
    if (selectedClass) {
      setSubjects(subjectsByClass[selectedClass] || []);
    } else {
      setSubjects([]);
    }
  }, [selectedClass, subjectsByClass]);

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
  const studentAverages = useMemo(() => {
    return filteredStudents.map((student) => {
      const r = results[student._id];
      const avg = r?.average ?? 0;
      return {
        name: `${student.firstName} ${student.lastName}`,
        average: avg,
      };
    });
  }, [filteredStudents, results]);

  const top3 = useMemo(() => {
    return [...studentAverages]
      .sort((a, b) => b.average - a.average)
      .slice(0, 3);
  }, [studentAverages]);

  const subjectPerformance = useMemo(() => {
    return subjects.map((subj) => {
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
        subject: subj, // MUST match table header
        average: count ? total / count : 0,
      };
    });
  }, [subjects, filteredStudents, results]);

  const gradeCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    filteredStudents.forEach((student) => {
      const grade = results[student._id]?.grade;
      if (grade) counts[grade] = (counts[grade] || 0) + 1;
    });
    return Object.keys(counts).map((g) => ({
      name: g,
      value: counts[g],
    }));
  }, [filteredStudents, results]);

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

      {/* Academic Year */}
      <input
        type="text"
        placeholder="Academic Year (e.g. 2025/2026)"
        value={academicYear}
        onChange={(e) => {
          setAcademicYear(e.target.value);
          setExamId("");
          setSelectedClass("");
          setResults({});
        }}
        className="p-2 w-full rounded bg-gray-800 text-white"
      />

      {/* Select Exam */}
      {academicYear && (
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
      )}

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
                  const studentResult = results[student._id] || {
                    subjects: [],
                  };
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
                <BarChart key={selectedClass} data={top3}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Performance */}
            <div className="bg-gray-900 p-4 rounded-lg shadow row-span-2">
              <h3 className="text-lg font-semibold mb-2">
                Best Performed Subjects
              </h3>
              <ResponsiveContainer width="100%" height={600}>
                <BarChart
                  key={selectedClass}
                  data={subjectPerformance}
                  margin={{ top: 20, right: 20, bottom: 60, left: 20 }} // add bottom margin
                >
                  <XAxis
                    dataKey="subject"
                    type="category"
                    interval={0}
                    angle={-35} // tilt more if needed
                    textAnchor="end"
                    height={100} // gives extra space for labels
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grade Distribution */}
            <div className="bg-gray-900 p-4 rounded-lg shadow col-span-1">
              <h3 className="text-lg font-semibold mb-2">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart key={selectedClass}>
                  <Pie
                    data={gradeCounts}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {gradeCounts.map((entry, index) => (
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
