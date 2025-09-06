import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const SetFeeExpectationPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [termFees, setTermFees] = useState({ "Term 1": "", "Term 2": "", "Term 3": "" });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students/students-with-subjects");
        setStudents(res.data.students || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch students");
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const loadExisting = async () => {
      if (!selectedStudent) return;
      try {
        const res = await api.get(`/students/${selectedStudent}`);
        const expectations = res.data.feeExpectations || [];
        const updated = { "Term 1": "", "Term 2": "", "Term 3": "" };
        expectations.forEach(f => {
          updated[f.term] = f.amount;
        });
        setTermFees(updated);
      } catch (err) {
        console.error(err);
      }
    };
    loadExisting();
  }, [selectedStudent]);

  const handleChange = (term, value) => {
    setTermFees(prev => ({ ...prev, [term]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedStudent) return alert("Select a student");
    try {
      await api.put(`/students/${selectedStudent}/fee-expectations`, {
        feeExpectations: [
          { term: "Term 1", amount: Number(termFees["Term 1"]) || 0 },
          { term: "Term 2", amount: Number(termFees["Term 2"]) || 0 },
          { term: "Term 3", amount: Number(termFees["Term 3"]) || 0 },
        ]
      });
      alert("Fee expectations saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save fee expectations");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Set Fee Expectations</h1>
      <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="p-2 w-full rounded bg-gray-800 text-white">
        <option value="">Select Student</option>
        {students.map(s => (
          <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
        ))}
      </select>
      <form onSubmit={handleSubmit} className="space-y-2">
        {["Term 1", "Term 2", "Term 3"].map(term => (
          <div key={term}>
            <label>{term} Fee:</label>
            <input
              type="number"
              value={termFees[term]}
              onChange={e => handleChange(term, e.target.value)}
              className="p-2 rounded w-full bg-gray-800 text-white"
            />
          </div>
        ))}
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Save Expectations</button>
      </form>
    </div>
  );
};

export default SetFeeExpectationPage;
