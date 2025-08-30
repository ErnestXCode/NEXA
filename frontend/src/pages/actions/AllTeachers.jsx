import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";

const AllTeachers = () => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get("/personel/teacher");
        setTeachers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <>
      <main className="p-6 bg-gray-950 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">All Teachers</h1>
        <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? (
              teachers.map((t, i) => (
                <tr key={t._id || i} className={`${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"} hover:bg-gray-800`}>
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center p-4 text-gray-400">No teachers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default AllTeachers;
