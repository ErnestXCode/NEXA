import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";

const RecordResultsPage = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [examId, setExamId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [results, setResults] = useState({});
  const [academicYear, setAcademicYear] = useState("");
  const [isDesktop, setIsDesktop] = useState(true);
  const currentUser = useSelector(selectCurrentUser);

  // 🔹 Set default academic year (currentYear/nextYear)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    setAcademicYear(`${year}/${year + 1}`);
  }, []);

  // 🔹 Check if user is on desktop
  useEffect(() => {
    const checkScreenSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // 🔹 Fetch exams & students
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

    const fetchStudents = async () => {
      try {
        const res = await api.get("/students/students-with-subjects");
        setStudents(res.data?.students || []);
        setSubjectsByClass(res.data?.subjectsByClass || {});
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };

    fetchExams();
    fetchStudents();
  }, [academicYear]);

  // 🔹 Fetch saved results when exam/class changes
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

  // if (!isDesktop) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
  //       <h1 className="mb-4 text-2xl font-bold">⚠️ Desktop Required</h1>
  //       <p className="text-gray-300">
  //         Recording results is only available on a desktop or laptop device.
  //         Please switch to a larger screen for the best experience.
  //       </p>
  //     </div>
  //   );
  // }

  const handleScoreChange = (studentId, subject, score) => {
    setResults((prev) => {
      const prevEntry = prev[studentId] || { subjects: [] };
      const prevSubjects = prevEntry.subjects || [];

      const updatedSubjects = prevSubjects.some((s) => s.name === subject)
        ? prevSubjects.map((s) => (s.name === subject ? { ...s, score } : s))
        : [...prevSubjects, { name: subject, score }];

      return {
        ...prev,
        [studentId]: {
          ...prevEntry,
          subjects: updatedSubjects,
        },
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const studentResults = Object.keys(results).map((id) => {
        const entry = results[id] || { subjects: [] };
        const subjectsArr = entry.subjects || [];

        return {
          studentId: id,
          subjects: subjectsArr,
        };
      });

      await api.post("/exams/results", {
        examId,
        studentResults,
      });

      alert("Results saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save results");
    }
  };

  const classLevels = [...new Set(students.map((s) => s.classLevel || "Unassigned"))];
  const filteredStudents = students.filter(
    (s) => selectedClass && s.classLevel === selectedClass
  );

  // 🔹 Role-based academic year edit
  const isEditableYear = ["admin", "superadmin"].includes(currentUser?.role);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Record Results</h1>

      {/* Step 0: Academic Year */}
      <input
        type="text"
        placeholder="Academic Year (e.g. 2025/2026)"
        value={academicYear}
        onChange={(e) => isEditableYear && setAcademicYear(e.target.value)}
        className={`p-2 w-full rounded bg-gray-800 text-white ${
          !isEditableYear ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!isEditableYear}
      />

      {/* Step 1: Select Exam */}
      {academicYear && (
        <select
          value={examId}
          onChange={(e) => {
            setExamId(e.target.value);
            setSelectedClass("");
            setSelectedSubject("");
            setResults({});
          }}
          className="w-full p-2 text-white bg-gray-800 rounded"
        >
          <option value="">Select Exam</option>
          {exams.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name} - {e.term} - {e.academicYear}
            </option>
          ))}
        </select>
      )}

      {/* Step 2: Select Class */}
      {examId && (
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedSubject("");
            setResults({});
          }}
          className="w-full p-2 text-white bg-gray-800 rounded"
        >
          <option value="">Select Class</option>
          {classLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      )}

      {/* Step 3: Select Subject */}
      {examId && selectedClass && (
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full p-2 text-white bg-gray-800 rounded"
        >
          <option value="">All Subjects (Admin Mode)</option>
          {(subjectsByClass[selectedClass] || []).map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      )}

      {/* Step 4: Results Table */}
      {examId && selectedClass && (
        <div className="p-4 overflow-auto bg-gray-900 rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">
            {selectedClass}{" "}
            {selectedSubject ? `— ${selectedSubject}` : "— All Subjects"}
          </h2>
          <table className="min-w-full border border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 text-left">Student</th>
                {selectedSubject ? (
                  <th className="p-2 text-left">{selectedSubject}</th>
                ) : (
                  (subjectsByClass[selectedClass] || []).map((subj) => (
                    <th key={subj} className="p-2 text-left">
                      {subj}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const studentResult = results[student._id] || { subjects: [] };
                const subjectsArr = studentResult.subjects || [];

                return (
                  <tr key={student._id} className="border-t border-gray-700">
                    <td className="p-2">
                      {student.firstName} {student.lastName}
                    </td>
                    {selectedSubject ? (
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            subjectsArr.find((s) => s.name === selectedSubject)?.score ?? ""
                          }
                          onChange={(e) =>
                            handleScoreChange(student._id, selectedSubject, Number(e.target.value))
                          }
                          className="w-20 p-1 text-white bg-gray-800 rounded no-spinner"
                        />
                      </td>
                    ) : (
                      (subjectsByClass[selectedClass] || []).map((subj) => (
                        <td key={subj} className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={subjectsArr.find((s) => s.name === subj)?.score ?? ""}
                            onChange={(e) =>
                              handleScoreChange(student._id, subj, Number(e.target.value))
                            }
                            className="w-20 p-1 text-white bg-gray-800 rounded no-spinner"
                          />
                        </td>
                      ))
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!examId || !selectedClass}
        className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
      >
        Save Results
      </button>

      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default RecordResultsPage;
