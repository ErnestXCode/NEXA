import React, { useState } from "react";
import api from "../../api/axios";
import { useMutation } from "@tanstack/react-query";

const OnboardStudentsBulk = () => {
  const [academicYear, setAcademicYear] = useState("2025");
  const [term, setTerm] = useState("Term 1");
  const [students, setStudents] = useState([
    { firstName: "", lastName: "", classLevel: "", openingBalance: 0 },
  ]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `/schools/${localStorage.getItem("schoolId")}/onboard-students`,
        {
          academicYear,
          term,
          students,
        }
      );
      return data;
    },
  });

  const handleAddRow = () => {
    setStudents([
      ...students,
      { firstName: "", lastName: "", classLevel: "", openingBalance: 0 },
    ]);
  };

  const handleChange = (i, field, value) => {
    const updated = [...students];
    updated[i][field] = value;
    setStudents(updated);
  };

  return (
    <div className="p-4  rounded shadow">
      <h2 className="text-lg font-bold mb-3">📥 Bulk Student Onboarding</h2>

      {/* Year & Term */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          placeholder="Academic Year"
          className="border p-2 rounded w-1/2"
        />
        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="border p-2 rounded w-1/2"
        >
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>
      </div>

      {/* Student Rows */}
      {students.map((s, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
          <input
            type="text"
            placeholder="First Name"
            value={s.firstName}
            onChange={(e) => handleChange(i, "firstName", e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={s.lastName}
            onChange={(e) => handleChange(i, "lastName", e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Class Level (e.g. Grade 3)"
            value={s.classLevel}
            onChange={(e) => handleChange(i, "classLevel", e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Opening Balance"
            value={s.openingBalance}
            onChange={(e) =>
              handleChange(i, "openingBalance", parseFloat(e.target.value) || 0)
            }
            className="border p-2 rounded"
          />
        </div>
      ))}

      <button
        onClick={handleAddRow}
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        + Add Row
      </button>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="ml-3 px-4 py-2 bg-green-600 text-white rounded"
      >
        {mutation.isPending ? "Submitting..." : "Submit"}
      </button>

      {mutation.isSuccess && (
        <p className="mt-2 text-green-600">
          ✅ {mutation.data.count} students onboarded successfully!
        </p>
      )}
      {mutation.isError && (
        <p className="mt-2 text-red-600">❌ Error: {mutation.error.message}</p>
      )}
    </div>
  );
};

export default OnboardStudentsBulk;
