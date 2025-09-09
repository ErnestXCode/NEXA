import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  saveAttendanceLocally,
  getAllAttendanceRecords,
  deleteAttendanceRecord,
} from "../../utils/indexedDB";

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState({});
  const [notifyParents, setNotifyParents] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  /** --- SYNC OFFLINE DATA --- */
  const syncOfflineData = async () => {
    const offlineRecords = await getAllAttendanceRecords();
    let syncedCount = 0;

    for (const record of offlineRecords) {
      try {
        await api.post("/attendance", record);
        await deleteAttendanceRecord(record.id);
        syncedCount++;
      } catch (err) {
        console.log("Sync failed, will retry later", err);
      }
    }

    setUnsyncedCount(offlineRecords.length - syncedCount);
  };

  useEffect(() => {
    window.addEventListener("online", syncOfflineData);
    syncOfflineData();
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  /** --- FETCH STUDENTS --- */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/attendance", { params: { date } });
        const allStudents = res.data;
        setStudents(allStudents);

        const levels = [...new Set(allStudents.map((s) => s.classLevel))];
        setClassLevels(levels);

        const defaultClass = levels.length === 1 ? levels[0] : "";
        setSelectedClass(defaultClass);

        // Initialize records with string keys
        const initialRecords = Object.fromEntries(
          allStudents.map((s) => [
            s._id.toString(),
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

  /** --- FILTER STUDENTS BY CLASS --- */
  useEffect(() => {
    if (selectedClass) {
      setFilteredStudents(
        students.filter((s) => s.classLevel === selectedClass)
      );
    } else {
      setFilteredStudents(students);
    }
  }, [students, selectedClass]);

  /** --- HANDLE CHANGE --- */
  const handleChange = (studentId, field, value) => {
    const key = studentId.toString();
    setRecords((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  /** --- HANDLE SUBMIT --- */
  const handleSubmit = async () => {
    const payload = {
      classLevel: selectedClass || students[0]?.classLevel,
      date,
      records: Object.entries(records).map(([studentId, data]) => {

        if(data.status === 'absent') console.log(data, studentId)
        return {
        studentId,
        status: data.status,
        reason: data.reason || "",
      }
      }),
      notifyParents,
    };

    if (!navigator.onLine) {
      await saveAttendanceLocally(payload);
      setUnsyncedCount((prev) => prev + 1);
      alert(
        "Offline: Attendance saved locally and will sync automatically when online ✅"
      );
      return;
    }

    try {
      await api.post("/attendance", payload);
      alert(`Attendance saved for ${date} ✅`);
    } catch (err) {
      console.error("Error saving attendance", err);
      alert("Error saving attendance, saved locally instead.");
      await saveAttendanceLocally(payload);
      setUnsyncedCount((prev) => prev + 1);
    }
  };

  return (
    <main className="p-4 md:p-6 bg-gray-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>

      {unsyncedCount > 0 && (
        <div className="mb-4 p-2 bg-yellow-600 rounded">
          ⚠ {unsyncedCount} record(s) waiting to sync.
        </div>
      )}

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
                  s._id.toString(),
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
                const key = s._id.toString();
                const showReason =
                  records[key]?.status === "absent" ||
                  records[key]?.status === "late";
                return (
                  <tr
                    key={key}
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
                          value={records[key]?.reason || ""}
                          onChange={(e) =>
                            handleChange(key, "reason", e.target.value)
                          }
                          placeholder="Reason"
                          className="absolute inset-0 w-full border rounded px-2 py-1 bg-gray-800 text-white"
                        />
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={records[key]?.status}
                        onChange={(e) =>
                          handleChange(key, "status", e.target.value)
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
            const key = s._id.toString();
            const showReason =
              records[key]?.status === "absent" ||
              records[key]?.status === "late";
            return (
              <div
                key={key}
                className="bg-gray-900 rounded-lg shadow p-4 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {s.firstName} {s.lastName}
                  </span>
                  <span className="text-gray-400 text-sm">{s.classLevel}</span>
                </div>
                {showReason && (
                  <input
                    type="text"
                    value={records[key]?.reason || ""}
                    onChange={(e) =>
                      handleChange(key, "reason", e.target.value)
                    }
                    placeholder="Reason"
                    className="border rounded px-2 py-1 bg-gray-800 text-white w-full"
                  />
                )}
                <select
                  value={records[key]?.status}
                  onChange={(e) =>
                    handleChange(key, "status", e.target.value)
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
