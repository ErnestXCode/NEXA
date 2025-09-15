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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#C71585"];

  // fetch exams
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

  // fetch students + subjects
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

  // update subjects for selected class
  useEffect(() => {
    if (selectedClass) {
      setSubjects(subjectsByClass[selectedClass] || []);
    } else {
      setSubjects([]);
    }
  }, [selectedClass, subjectsByClass]);

  // fetch results
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

  // compute averages
  const studentAverages = useMemo(() => {
    return filteredStudents.map((student) => {
      const r = results[student._id];
      const avg = r?.average ?? 0;
      return {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        average: avg,
      };
    });
  }, [filteredStudents, results]);

  // assign positions by sorting
  const studentRanks = useMemo(() => {
    const sorted = [...studentAverages].sort((a, b) => b.average - a.average);
    return sorted.map((s, idx) => ({ ...s, position: idx + 1 }));
  }, [studentAverages]);

  const top3 = useMemo(() => {
    return [...studentAverages].sort((a, b) => b.average - a.average).slice(0, 3);
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
        subject: subj,
        average: count ? total / count : 0,
      };
    });
  }, [subjects, filteredStudents, results]);

 const handleDownload = async (studentId, positionText) => {
  try {
    const res = await api.post(
      `/reports/student/${examId}/${studentId}`,
      { positionText }, // 👈 send in body
      { responseType: "blob" }
    );
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
                  <th className="p-2 text-left">Position</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentRanks.map((ranked) => {
                  const student = students.find((s) => s._id === ranked.id);
                  const studentResult = results[student._id] || { subjects: [] };
                  const subjectsArr = studentResult.subjects || [];

                  return (
                    <tr key={student._id} className="border-t border-gray-700">
                      <td className="p-2">
                        {student.firstName} {student.lastName}
                      </td>
                      {subjects.map((subj) => (
                        <td key={subj} className="p-2">
                          {subjectsArr.find((s) => s.name === subj)?.score ?? "-"}
                        </td>
                      ))}
                      <td className="p-2">{ranked.average.toFixed(1)}</td>
                      <td className="p-2">{ranked.position}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDownload(student._id, `${ranked.position} / ${studentRanks.length}`)}
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

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Top 3 */}
            <div className="bg-gray-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Top 3 Students</h3>
              <ResponsiveContainer width="100%" height={600}>
                <BarChart key={selectedClass} data={top3}>
                  <XAxis dataKey="name"  height={100}  interval={0}
                    angle={-35}
                    textAnchor="end"/>
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
              <ResponsiveContainer width="100%" height={600}>
                <BarChart
                  key={selectedClass}
                  data={subjectPerformance}
                  margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                >
                  <XAxis
                    dataKey="subject"
                    type="category"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportCardsPage;
