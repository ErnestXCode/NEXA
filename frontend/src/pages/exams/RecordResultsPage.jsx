import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const RecordResultsPage = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examId, setExamId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [results, setResults] = useState({});

  // 🔹 Fetch exams & students (initial)
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

  // 🔹 Fetch subjects for selected class (NEW)
  useEffect(() => {
    const fetchSubjectsForClass = async () => {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }
      try {
        // calls the backend endpoint we added
        const res = await api.get(`/schools/subjects/${encodeURIComponent(selectedClass)}`);
        setSubjects(res.data?.subjects || []);
      } catch (err) {
        console.error("Failed to fetch subjects for class", err);
        setSubjects([]);
      }
    };
    fetchSubjectsForClass();
  }, [selectedClass]);

  // 🔹 Fetch saved results when exam/class changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!examId || !selectedClass) return;
      try {
        const res = await api.get(
          `/exams/results/${examId}/${encodeURIComponent(selectedClass)}`
        );

        // Map each studentId → full result object
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

        const total = subjectsArr.reduce((acc, s) => acc + (s.score || 0), 0);
        const average = subjectsArr.length ? total / subjectsArr.length : 0;
        const grade =
          average >= 80 ? "A" : average >= 70 ? "B" : average >= 60 ? "C" : average >= 50 ? "D" : "E";

        return {
          studentId: id,
          subjects: subjectsArr,
          total,
          average,
          grade,
        };
      });

      await api.post("/exams/results", { examId, studentResults, classLevel: selectedClass });
      alert("Results saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save results");
    }
  };

  const classLevels = [...new Set(students.map((s) => s.classLevel || "Unassigned"))];
  const filteredStudents = students.filter((s) => selectedClass && s.classLevel === selectedClass);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Record Results</h1>

      {/* Step 1: Select Exam */}
      <select
        value={examId}
        onChange={(e) => {
          setExamId(e.target.value);
          setSelectedClass("");
          setSelectedSubject("");
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

      {/* Step 2: Select Class */}
      {examId && (
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedSubject("");
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

      {/* Step 3: Select Subject */}
      {examId && selectedClass && (
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2 w-full rounded bg-gray-800 text-white"
        >
          <option value="">All Subjects (Admin Mode)</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      )}

      {/* Step 4: Results Table */}
      {examId && selectedClass && (
        <div className="bg-gray-900 p-4 rounded-lg shadow overflow-auto">
          <h2 className="text-lg font-semibold mb-2">
            {selectedClass} {selectedSubject ? `— ${selectedSubject}` : "— All Subjects"}
          </h2>
          <table className="min-w-full border border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 text-left">Student</th>
                {selectedSubject ? (
                  <th className="p-2 text-left">{selectedSubject}</th>
                ) : (
                  subjects.map((subj) => (
                    <th key={subj} className="p-2 text-left">
                      {subj}
                    </th>
                  ))
                )}
                <th className="p-2 text-left">Average</th>
                <th className="p-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const studentResult = results[student._id] || { subjects: [] };
                const subjectsArr = studentResult.subjects || [];

                const total = subjectsArr.reduce((acc, s) => acc + (s.score || 0), 0);
                const average = subjectsArr.length ? total / subjectsArr.length : 0;
                const grade =
                  average >= 80 ? "A" : average >= 70 ? "B" : average >= 60 ? "C" : average >= 50 ? "D" : "E";

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
                          value={subjectsArr.find((s) => s.name === selectedSubject)?.score ?? ""}
                          onChange={(e) =>
                            handleScoreChange(student._id, selectedSubject, Number(e.target.value))
                          }
                          className="p-1 w-20 rounded bg-gray-800 text-white no-spinner"
                        />
                      </td>
                    ) : (
                      subjects.map((subj) => (
                        <td key={subj} className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={subjectsArr.find((s) => s.name === subj)?.score ?? ""}
                            onChange={(e) => handleScoreChange(student._id, subj, Number(e.target.value))}
                            className="p-1 w-20 rounded bg-gray-800 text-white no-spinner"
                          />
                        </td>
                      ))
                    )}
                    <td className="p-2">{average.toFixed(1)}</td>
                    <td className="p-2">{grade}</td>
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
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
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
