// src/pages/exams/ReportCard.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import jsPDF from "jspdf";

const fetchReportCard = async (studentId, term) => {
  const res = await api.get(`/exam/report-card/${studentId}/${term}`);
  return res.data;
};

const ReportCard = () => {
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [report, setReport] = useState(null);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/students")).data,
  });

  const handleFetch = async () => {
    if (!studentId) return;
    const data = await fetchReportCard(studentId, term);
    setReport(data);
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    const { student, termResults } = report;
    doc.setFontSize(16);
    doc.text(`${student.firstName} ${student.lastName} - ${term}`, 20, 20);
    doc.setFontSize(12);
    let y = 30;
    termResults.forEach((exam) => {
      doc.text(`Exam: ${exam.exam.name} (${exam.term})`, 20, y);
      y += 6;
      doc.text("Subject       Score", 20, y);
      y += 6;
      exam.results.forEach(r => {
        doc.text(`${r.subject}       ${r.score}`, 20, y);
        y += 6;
      });
      doc.text(`Total: ${exam.total}   Average: ${exam.average.toFixed(2)}   Grade: ${exam.grade}`, 20, y);
      y += 10;
    });
    doc.save(`ReportCard_${student.firstName}_${term}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!report) return;
    try {
      await api.post("/exam/send-report-email", { studentId, term });
      alert("✅ Email sent successfully!");
    } catch (err) {
      alert("❌ Failed to send email");
    }
  };

  const handleSendSMS = async () => {
    if (!report) return;
    try {
      await api.post("/exam/send-report-sms", { studentId, term });
      alert("✅ SMS sent successfully!");
    } catch (err) {
      alert("❌ Failed to send SMS");
    }
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Student Report Card</h1>

      <div className="flex gap-2 mb-4 max-w-md">
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-2/3 p-2 rounded bg-gray-900"
        >
          <option value="">Select Student</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
          ))}
        </select>

        <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-1/3 p-2 rounded bg-gray-900">
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>

        <button onClick={handleFetch} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">Fetch</button>
      </div>

      {report && (
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{report.student.firstName} {report.student.lastName} - {term}</h2>
          {report.termResults.map((exam, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-semibold">Exam: {exam.exam.name}</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Subject</th>
                    <th className="px-2 py-1">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.results.map((r, j) => (
                    <tr key={j}>
                      <td className="px-2 py-1">{r.subject}</td>
                      <td className="px-2 py-1">{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>Total: {exam.total} | Average: {exam.average.toFixed(2)} | Grade: {exam.grade}</p>
            </div>
          ))}

          <div className="flex gap-2 mt-4">
            <button onClick={handleDownloadPDF} className="bg-green-600 hover:bg-green-700 p-2 rounded">Download PDF</button>
            <button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">Email Parent</button>
            <button onClick={handleSendSMS} className="bg-purple-600 hover:bg-purple-700 p-2 rounded">Send SMS</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ReportCard;
