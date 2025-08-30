import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const AllStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const res = await api.get("/students");
        setStudents(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllStudents();
  }, []);

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Students</h1>
        <input
          type="text"
          placeholder="Search students..."
          className="mt-3 md:mt-0 bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72"
        />
      </div>

      {/* Students Table */}
      <div className="bg-gray-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Admission #</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Gender</th>
              <th className="py-3 px-4 text-left">DOB</th>
              <th className="py-3 px-4 text-left">Class</th>
              <th className="py-3 px-4 text-left">Guardian</th>
              <th className="py-3 px-4 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student, i) => (
                <tr
                  key={student.admissionNumber}
                  className={`${
                    i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                  } hover:bg-gray-800 transition`}
                >
                  <td className="py-2 px-4">{student.admissionNumber}</td>
                  <td className="py-2 px-4">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="py-2 px-4">{student.gender}</td>
                  <td className="py-2 px-4">{student.dateOfBirth}</td>
                  <td className="py-2 px-4">{student.classLevel}</td>
                  <td className="py-2 px-4">{student.guardianName}</td>
                  <td className="py-2 px-4">{student.guardianPhone}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-400"
                >
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default AllStudents;
