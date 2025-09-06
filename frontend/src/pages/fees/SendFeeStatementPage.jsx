import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const SendFeeStatementPage = () => {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSMS, setSendSMS] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students/students-with-subjects");
        setStudents(res.data.students || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  const handleSend = async () => {
    if (!studentId) return alert("Select a student");
    try {
      await api.post("/fees/send-fee-statement", { studentId, term, sendEmail, sendSMS });
      alert("Fee statement sent successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to send statement");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Send Fee Statement</h1>
      <select value={studentId} onChange={e => setStudentId(e.target.value)} className="p-2 w-full rounded bg-gray-800 text-white">
        <option value="">Select Student</option>
        {students.map(s => (
          <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
        ))}
      </select>
      <select value={term} onChange={e => setTerm(e.target.value)} className="p-2 w-full rounded bg-gray-800 text-white">
        <option>Term 1</option>
        <option>Term 2</option>
        <option>Term 3</option>
      </select>
      <div className="flex space-x-4">
        <label><input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} /> Email</label>
        <label><input type="checkbox" checked={sendSMS} onChange={e => setSendSMS(e.target.checked)} /> SMS</label>
      </div>
      <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Send Statement</button>
    </div>
  );
};

export default SendFeeStatementPage;
