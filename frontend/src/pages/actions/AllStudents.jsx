import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";

const AllStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students");
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  return (
    <>
      <main className="p-6 bg-gray-950 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">All Students</h1>
        <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left">Admission #</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Gender</th>
              <th className="p-2 text-left">DOB</th>
              <th className="p-2 text-left">Class</th>
              <th className="p-2 text-left">Guardian</th>
              <th className="p-2 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((s, i) => (
                <tr key={s.admissionNumber} className={`${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"} hover:bg-gray-800`}>
                  <td className="p-2">{s.admissionNumber}</td>
                  <td className="p-2">{s.firstName} {s.lastName}</td>
                  <td className="p-2">{s.gender}</td>
                  <td className="p-2">{s.dateOfBirth}</td>
                  <td className="p-2">{s.classLevel}</td>
                  <td className="p-2">{s.guardianName}</td>
                  <td className="p-2">{s.guardianPhone}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-400">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default AllStudents;
