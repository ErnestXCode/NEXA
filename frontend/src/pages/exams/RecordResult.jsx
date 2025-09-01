// src/pages/exams/RecordResult.jsx
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import * as XLSX from "xlsx";

const RecordResult = () => {
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => (await api.get("/exam")).data,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/students")).data,
  });

  const [examId, setExamId] = useState("");
  const [tableData, setTableData] = useState([]);

  const recordMutation = useMutation({
    mutationFn: (data) => api.post("/exam/record-result", data),
    onSuccess: () => {
      alert("✅ Results saved");
      setTableData([]);
      setExamId("");
      queryClient.invalidateQueries(["students"]);
      queryClient.invalidateQueries(["exams"]);
    },
    onError: () => alert("❌ Failed to save results"),
  });

  // Hardcoded subjects for now
  const subjects = ["Math", "English", "Science", "History", "Kiswahili"];

  // Build table rows
  const tableRows = useMemo(() => {
    if (!examId) return [];
    const exam = exams.find((e) => e._id === examId);
    if (!exam) return [];
    return students
      .filter((s) => exam.classes.includes(s.classLevel))
      .map((s) => ({
        studentId: s._id,
        admissionNumber: s.admissionNumber,
        name: `${s.firstName} ${s.lastName}`,
        classLevel: s.classLevel,
        subjects: subjects.reduce((acc, sub) => ({ ...acc, [sub]: 0 }), {}),
      }));
  }, [examId, students, exams]);

  // Sync tableData
  React.useEffect(() => {
    setTableData(tableRows);
  }, [tableRows]);

  const handleScoreChange = (rowIndex, subject, value) => {
    const newData = [...tableData];
    newData[rowIndex].subjects[subject] = Number(value);
    setTableData(newData);
  };

  const handleSave = () => {
    const studentResults = tableData.map((s) => ({
      studentId: s.studentId,
      subjects: Object.entries(s.subjects).map(([name, score]) => ({ name, score })),
    }));
    recordMutation.mutate({ examId, studentResults });
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = data.Sheets[data.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      const newTableData = tableData.map((row) => {
        const csvRow = json.find(
          (j) =>
            j.StudentId === row.studentId || j.AdmissionNumber === row.admissionNumber
        );
        if (csvRow) {
          const subjectsCopy = { ...row.subjects };
          Object.keys(subjectsCopy).forEach((sub) => {
            if (csvRow[sub] != null) subjectsCopy[sub] = Number(csvRow[sub]);
          });
          return { ...row, subjects: subjectsCopy };
        }
        return row;
      });
      setTableData(newTableData);
    };
    reader.readAsBinaryString(file);
  };

  if (examsLoading || studentsLoading) return <p className="p-6 text-gray-300">Loading...</p>;

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Record Results</h1>

      <div className="mb-4 flex gap-2">
        <select
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          className="p-2 rounded bg-gray-900"
        >
          <option value="">Select Exam</option>
          {exams.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name} ({e.term})
            </option>
          ))}
        </select>

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleCSVUpload}
          className="p-2 rounded bg-gray-900"
        />

        <button
          onClick={handleSave}
          disabled={!examId || tableData.length === 0}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          Save All
        </button>
      </div>

      {tableData.length > 0 && (
        <div className="overflow-x-auto bg-gray-900 p-2 rounded">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Admission #</th>
                <th className="border px-2 py-1">Student</th>
                <th className="border px-2 py-1">Class</th>
                {subjects.map((sub) => (
                  <th key={sub} className="border px-2 py-1">{sub}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={row.studentId}>
                  <td className="border px-2 py-1">{row.admissionNumber}</td>
                  <td className="border px-2 py-1">{row.name}</td>
                  <td className="border px-2 py-1">{row.classLevel}</td>
                  {subjects.map((sub) => (
                    <td key={sub} className="border px-2 py-1">
                      <input
                        type="number"
                        value={row.subjects[sub]}
                        onChange={(e) => handleScoreChange(rowIndex, sub, e.target.value)}
                        className="w-full p-1 rounded bg-gray-800 text-white"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default RecordResult;
