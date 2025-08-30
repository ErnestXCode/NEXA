import React, { useEffect, useState } from "react";
import api from "../../api/axios";


const AllBursars = () => {
  const [bursars, setBursars] = useState([]);

  useEffect(() => {
    const fetchBursars = async () => {
      try {
        const res = await api.get("/personel/bursar");
        setBursars(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBursars();
  }, []);

  return (
    <>
      <main className="p-6 bg-gray-950 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">All Bursars</h1>
        <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {bursars.length > 0 ? (
              bursars.map((b, i) => (
                <tr key={b._id || i} className={`${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"} hover:bg-gray-800`}>
                  <td className="p-2">{b.name}</td>
                  <td className="p-2">{b.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center p-4 text-gray-400">No bursars found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default AllBursars;
