import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAttendanceByClassAndDate } from "../../api/attendance";
import api from "../../api/axios";

// fetch all attendance for a week
// src/pages/attendance/WeeklyReport.jsx
const fetchWeeklyAttendance = async (classLevel, startDate, endDate) => {
  const res = await api.get(`/attendance/class/${classLevel}/range`, {
    params: { startDate, endDate },
  });
  return res.data;
};


const WeeklyReport = () => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  const [classLevel, setClassLevel] = useState("");
  const [startDate, setStartDate] = useState(
    lastWeek.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["weeklyAttendance", classLevel, startDate, endDate],
    queryFn: () => fetchWeeklyAttendance(classLevel, startDate, endDate),
    enabled: !!classLevel,
  });

  // Group by student
  const summary = {};
  records.forEach((rec) => {
    const id = rec.student?._id;
    if (!id) return;

    if (!summary[id]) {
      summary[id] = {
        student: `${rec.student.firstName} ${rec.student.lastName}`,
        classLevel: rec.classLevel,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      };
    }

    summary[id].total++;
    if (rec.status === "present") summary[id].present++;
    if (rec.status === "absent") summary[id].absent++;
    if (rec.status === "late") summary[id].late++;
  });

  const summaryArr = Object.values(summary);

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Weekly Attendance Report</h1>

      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Class Level"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          className="p-2 rounded bg-gray-900"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 rounded bg-gray-900"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 rounded bg-gray-900"
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : summaryArr.length === 0 ? (
        <p>No attendance records for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3">Class</th>
                <th className="p-3">Present</th>
                <th className="p-3">Absent</th>
                <th className="p-3">Late</th>
                <th className="p-3">Total</th>
                <th className="p-3">% Present</th>
              </tr>
            </thead>
            <tbody>
              {summaryArr.map((s) => {
                const presentPct = ((s.present / s.total) * 100).toFixed(1);
                return (
                  <tr
                    key={s.student}
                    className="border-t border-gray-700 hover:bg-gray-800"
                  >
                    <td className="p-3">{s.student}</td>
                    <td className="p-3 text-center">{s.classLevel}</td>
                    <td className="p-3 text-green-400">{s.present}</td>
                    <td className="p-3 text-red-400">{s.absent}</td>
                    <td className="p-3 text-yellow-400">{s.late}</td>
                    <td className="p-3">{s.total}</td>
                    <td className="p-3">{presentPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default WeeklyReport;
