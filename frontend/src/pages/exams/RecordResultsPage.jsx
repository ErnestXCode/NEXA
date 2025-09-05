import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const RecordResultsPage = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examId, setExamId] = useState("");
  const [results, setResults] = useState({});

  useEffect(() => {
    const fetchExams = async () => {
      const res = await api.get("/exams");
      setExams(res.data);
    };

    const fetchStudentsAndSubjects = async () => {
      const res = await api.get("/students/students-with-subjects");
      setStudents(res.data.students);
      setSubjects(res.data.subjects);
    };

    fetchExams();
    fetchStudentsAndSubjects();
  }, []);

  const handleScoreChange = (studentId, subject, score) => {
    setResults((prev) => {
      const prevSubjects = prev[studentId] || [];
      const updated = prevSubjects.some((s) => s.name === subject)
        ? prevSubjects.map((s) =>
            s.name === subject ? { ...s, score } : s
          )
        : [...prevSubjects, { name: subject, score }];

      return { ...prev, [studentId]: updated };
    });
  };

  const handleSubmit = async () => {
    try {
      const studentResults = Object.keys(results).map((id) => ({
        studentId: id,
        subjects: results[id],
      }));
      await api.post("/exams/results", { examId, studentResults });
      alert("Results saved!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Record Results</h1>

      <select
        value={examId}
        onChange={(e) => setExamId(e.target.value)}
        className="p-2 w-full rounded bg-gray-800 text-white"
      >
        <option value="">Select Exam</option>
        {exams.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name} - {e.term}
          </option>
        ))}
      </select>

      <div className="bg-gray-900 p-4 rounded-lg shadow overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="p-2">Student</th>
              {subjects.map((subj) => (
                <th key={subj} className="p-2">{subj}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td className="p-2">
                  {student.firstName} {student.lastName}
                </td>
                {subjects.map((subj) => (
                  <td key={subj} className="p-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={
                        results[student._id]?.find((s) => s.name === subj)
                          ?.score || ""
                      }
                      onChange={(e) =>
                        handleScoreChange(student._id, subj, Number(e.target.value))
                      }
                      className="p-1 w-20 rounded bg-gray-800 text-white"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!examId}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Save Results
      </button>
    </div>
  );
};

export default RecordResultsPage;
