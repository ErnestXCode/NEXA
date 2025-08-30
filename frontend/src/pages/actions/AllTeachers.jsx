import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const AllTeachers = () => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const res = await api.get("/personel/teacher");
        setTeachers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllTeachers();
  }, []);

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Teachers</h1>
        <input
          type="text"
          placeholder="Search teachers..."
          className="mt-3 md:mt-0 bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72"
        />
      </div>

      {/* Teachers Table */}
      <div className="bg-gray-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? (
              teachers.map((teacher, i) => (
                <tr
                  key={teacher._id || i}
                  className={`${
                    i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                  } hover:bg-gray-800 transition`}
                >
                  <td className="py-2 px-4">{teacher.name}</td>
                  <td className="py-2 px-4">{teacher.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="text-center py-6 text-gray-400"
                >
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default AllTeachers;
