import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState({});
  const [notifyParents, setNotifyParents] = useState(false);

  // Fetch students when date or class changes
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/attendance", { params: { date } });
        const allStudents = res.data;
        setStudents(allStudents);

        // extract unique classLevels
        const levels = [...new Set(allStudents.map((s) => s.classLevel))];
        setClassLevels(levels);

        // default filter
        const defaultClass = levels.length === 1 ? levels[0] : "";
        setSelectedClass(defaultClass);

        // initialize records for that date
        const initialRecords = Object.fromEntries(
          allStudents.map((s) => [
            s._id,
            {
              status: s.attendance?.status || "present",
              reason: s.attendance?.reason || "",
            },
          ])
        );
        setRecords(initialRecords);
      } catch (err) {
        console.error("Error fetching students", err);
      }
    };

    fetchStudents();
  }, [date]);

  // Filter students when selectedClass changes
  useEffect(() => {
    if (selectedClass) {
      setFilteredStudents(
        students.filter((s) => s.classLevel === selectedClass)
      );
    } else {
      setFilteredStudents(students);
    }
  }, [students, selectedClass]);

  const handleChange = (studentId, field, value) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        classLevel: selectedClass || students[0]?.classLevel,
        date,
        records: Object.entries(records).map(([studentId, data]) => ({
          studentId,
          status: data.status || "present",
          reason: data.reason || "",
        })),
        notifyParents,
      };

      await api.post("/attendance", payload);
      alert(`Attendance saved for ${date} ✅`);
    } catch (err) {
      console.error("Error saving attendance", err);
      alert("Error saving attendance");
    }
  };

  return (
    <main className="p-4 md:p-6 bg-gray-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded bg-gray-800"
        />

        {classLevels.length > 1 && (
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="">All Classes</option>
            {classLevels.map((level, idx) => (
              <option key={idx} value={level}>
                {level}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() =>
            setRecords(
              Object.fromEntries(
                filteredStudents.map((s) => [
                  s._id,
                  { status: "present", reason: "" },
                ])
              )
            )
          }
          className="bg-green-600 hover:bg-green-700 p-2 rounded"
        >
          Mark All Present
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          Save Attendance
        </button>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={notifyParents}
            onChange={(e) => setNotifyParents(e.target.checked)}
            className="accent-blue-500"
          />
          <span>Notify Parents</span>
        </label>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Student</th>
              <th className="py-3 px-4 text-left">Class</th>
              <th className="py-3 px-4 text-left"></th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s, i) => {
                const showReason =
                  records[s._id]?.status === "absent" ||
                  records[s._id]?.status === "late";
                return (
                  <tr
                    key={s._id}
                    className={`${
                      i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                    } hover:bg-gray-800 transition`}
                  >
                    <td className="py-2 px-4">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="py-2 px-4">{s.classLevel}</td>
                    <td className="py-2 px-2 w-32 relative">
                      {showReason && (
                        <input
                          type="text"
                          value={records[s._id]?.reason || ""}
                          onChange={(e) =>
                            handleChange(s._id, "reason", e.target.value)
                          }
                          placeholder="Reason"
                          className="absolute inset-0 w-full border rounded px-2 py-1 bg-gray-800 text-white"
                        />
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={records[s._id]?.status}
                        onChange={(e) =>
                          handleChange(s._id, "status", e.target.value)
                        }
                        className="border rounded px-2 py-1 bg-gray-800 text-white"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((s) => {
            const showReason =
              records[s._id]?.status === "absent" ||
              records[s._id]?.status === "late";
            return (
              <div
                key={s._id}
                className="bg-gray-900 rounded-lg shadow p-4 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{s.firstName} {s.lastName}</span>
                  <span className="text-gray-400 text-sm">{s.classLevel}</span>
                </div>
                {showReason && (
                  <input
                    type="text"
                    value={records[s._id]?.reason || ""}
                    onChange={(e) =>
                      handleChange(s._id, "reason", e.target.value)
                    }
                    placeholder="Reason"
                    className="border rounded px-2 py-1 bg-gray-800 text-white w-full"
                  />
                )}
                <select
                  value={records[s._id]?.status}
                  onChange={(e) =>
                    handleChange(s._id, "status", e.target.value)
                  }
                  className="border rounded px-2 py-1 bg-gray-800 text-white w-full"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-400">No students found.</div>
        )}
      </div>
    </main>
  );
};

export default AttendancePage;
