import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const StudentFeeDetail = ({ studentId, onBack }) => {
  const [selectedTerm, setSelectedTerm] = useState("Term 1");

  const { data: student = {}, isLoading: studentLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => api.get(`/students/${studentId}`).then(res => res.data),
    staleTime: Infinity,
  });

  const { data: feeRecords = [], isLoading: feesLoading } = useQuery({
    queryKey: ["studentFees", studentId, selectedTerm],
    queryFn: () => api.get(`/fees/student/${studentId}?term=${selectedTerm}`).then(res => res.data),
    staleTime: Infinity,
  });

  const mutationSend = useMutation({
    mutationFn: (payload) => api.post("/fees/student/send-statement", payload),
    onSuccess: () => alert("✅ Statement sent successfully!"),
    onError: (err) => alert(`❌ Failed to send statement: ${err.response?.data?.msg || err.message}`),
  });

  if (studentLoading || feesLoading) return <p className="p-6 text-white">Loading...</p>;

  const termFees = student.feeExpectations?.find(f => f.term === selectedTerm);
  const paid = feeRecords.reduce((sum, f) => sum + f.amount, 0);
  const balance = (termFees?.amount || 0) - paid;

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${student.firstName} ${student.lastName} - ${selectedTerm} Fee Statement`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Class: ${student.classLevel}`, 14, 30);
    doc.text(`Expected Fee: KSh ${termFees?.amount || 0}`, 14, 37);
    doc.text(`Paid: KSh ${paid}`, 14, 44);
    doc.text(`Balance: KSh ${balance}`, 14, 51);

    const tableData = feeRecords.map(p => [
      new Date(p.date).toLocaleDateString(),
      p.amount,
      p.type,
      p.note || "-",
    ]);

    doc.autoTable({
      startY: 60,
      head: [["Date", "Amount (KSh)", "Type", "Note"]],
      body: tableData,
    });

    doc.save(`${student.firstName}_${student.lastName}_${selectedTerm}_Fees.pdf`);
  };

  return (
    <main className="p-6 bg-gray-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">{student.firstName} {student.lastName} - Fee Details</h1>

      <button onClick={onBack} className="mb-4 bg-gray-700 hover:bg-gray-600 p-2 rounded">← Back</button>

      <div className="mb-4 flex gap-4 items-center">
        <label>Term:</label>
        <select
          value={selectedTerm}
          onChange={e => setSelectedTerm(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="bg-gray-800 p-4 rounded">Expected: KSh {termFees?.amount || 0}</div>
        <div className="bg-gray-800 p-4 rounded">Paid: KSh {paid}</div>
        <div className={`p-4 rounded ${balance === 0 ? "bg-green-700" : "bg-red-700"}`}>Balance: KSh {balance}</div>
      </div>

      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden mb-6">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Note</th>
          </tr>
        </thead>
        <tbody>
          {feeRecords.length > 0 ? feeRecords.map((f, i) => (
            <tr key={f._id} className={i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}>
              <td className="p-2">{new Date(f.date).toLocaleDateString()}</td>
              <td className="p-2">{f.amount}</td>
              <td className="p-2">{f.type}</td>
              <td className="p-2">{f.note || "-"}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-400">No payments found for {selectedTerm}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex gap-4">
        <button onClick={handleGeneratePDF} className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold">
          Generate PDF Statement
        </button>

        <button onClick={() =>
          mutationSend.mutate({ studentId, term: selectedTerm, sendEmail: true, sendSMS: false })
        } className="bg-green-600 hover:bg-green-700 p-2 rounded font-semibold">
          Send Statement to Parent
        </button>
      </div>
    </main>
  );
};

export default StudentFeeDetail;
