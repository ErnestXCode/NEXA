// src/pages/attendance/Attendance.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchAttendance = async (filter) => {
  const query = new URLSearchParams(filter).toString();
  const res = await api.get(`/attendance/get?${query}`);
  return res.data;
};

const Attendance = () => {
  const [filter, setFilter] = useState({
    status: "",
    classLevel: "",
    stream: "",
    date: "",
  });

  const { data: attendance = [], refetch, isFetching } = useQuery({
    queryKey: ["attendance", filter],
    queryFn: () => fetchAttendance(filter),
    staleTime: Infinity, // stays fresh until invalidated
    keepPreviousData: true,
  });

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    refetch();
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>

      {/* Filter Form */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-gray-900 p-4 rounded-lg mb-6 flex flex-wrap gap-4"
      >
        <input
          type="text"
          name="status"
          placeholder="Status"
          value={filter.status}
          onChange={handleFilterChange}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="text"
          name="classLevel"
          placeholder="Class Level"
          value={filter.classLevel}
          onChange={handleFilterChange}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="text"
          name="stream"
          placeholder="Stream"
          value={filter.stream}
          onChange={handleFilterChange}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="date"
          name="date"
          value={filter.date}
          onChange={handleFilterChange}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          {isFetching ? "Filtering..." : "Filter"}
        </button>
      </form>

      <div className="bg-gray-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Student</th>
              <th className="py-3 px-4 text-left">Class</th>
              <th className="py-3 px-4 text-left">Stream</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length > 0 ? (
              attendance.map((record, i) => (
                <tr
                  key={record._id || i}
                  className={`${
                    i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                  } hover:bg-gray-800 transition`}
                >
                  <td className="py-2 px-4">
                    {record.student?.firstName} {record.student?.lastName}
                  </td>
                  <td className="py-2 px-4">{record.classLevel}</td>
                  <td className="py-2 px-4">{record.stream || "-"}</td>
                  <td className="py-2 px-4">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{record.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Attendance;
