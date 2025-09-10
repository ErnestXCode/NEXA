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
  <main className="flex flex-col overflow-y-hidden bg-gray-950 text-white">
  {/* Header & Controls */}
{/* Header & Controls */}
<div className="p-4 md:p-6 flex-shrink-0 space-y-4">
  {/* Title */}
  <h1 className="text-2xl font-bold">Mark Attendance</h1>

  {/* Sync Alert */}
  {unsyncedCount > 0 && (
    <div className="p-3 bg-yellow-700/40 border border-yellow-600 rounded-lg text-sm">
      ⚠ {unsyncedCount} record(s) waiting to sync.
    </div>
  )}

  {/* Controls container */}
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    {/* Left group: date + class */}
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {classLevels.length > 1 && (
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Classes</option>
          {classLevels.map((level, idx) => (
            <option key={idx} value={level}>
              {level}
            </option>
          ))}
        </select>
      )}
    </div>

    {/* Right group: actions */}
    <div className="flex flex-wrap items-center gap-3">
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
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
      >
        Mark All Present
      </button>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
      >
        Save Attendance
      </button>

      {/* Notify toggle */}
{/* <div className="flex items-center gap-2">
  <span className="text-sm text-gray-300">Notify Parents</span>
  <button
    type="button"
    onClick={() => setNotifyParents(!notifyParents)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
      notifyParents ? "bg-blue-600" : "bg-gray-600"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        notifyParents ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
</div> */}

    </div>
  </div>
</div>


  {/* Scrollable Section */}
  <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
    {/* Desktop Table */}
<div className="hidden md:block bg-gray-900 rounded-lg shadow overflow-hidden">
  <div className="max-h-[65vh] overflow-y-auto">
    <table className="w-full text-sm border-collapse">
      <thead className="sticky top-0 bg-gray-800 z-10">
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
                <td className="py-2 px-4 whitespace-nowrap">
                  {s.firstName} {s.lastName}
                </td>
                <td className="py-2 px-4">{s.classLevel}</td>
                <td className="py-2 px-2 w-32">
                  {showReason && (
                    <input
                      type="text"
                      value={records[key]?.reason || ""}
                      onChange={(e) =>
                        handleChange(key, "reason", e.target.value)
                      }
                      placeholder="Reason"
                      className="w-full border rounded px-2 py-1 bg-gray-800 text-white"
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
</div>


    {/* Mobile List */}
    <div className="md:hidden bg-gray-900 rounded-lg shadow overflow-hidden">
      {/* Fixed Mobile Header */}
      <div className="bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-300 flex justify-between">
        <span>Student</span>
        <span>Status</span>
      </div>

      {/* Scrollable list */}
      <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-800">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((s) => {
            const key = s._id.toString();
            const showReason =
              records[key]?.status === "absent" || records[key]?.status === "late";
            return (
              <div key={key} className="p-3 flex flex-col">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{s.classLevel}</p>
                  </div>
                  <select
                    value={records[key]?.status}
                    onChange={(e) => handleChange(key, "status", e.target.value)}
                    className="border rounded px-2 py-1 bg-gray-800 text-white text-sm"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>

                {showReason && (
                  <input
                    type="text"
                    value={records[key]?.reason || ""}
                    onChange={(e) => handleChange(key, "reason", e.target.value)}
                    placeholder="Reason"
                    className="mt-2 border rounded px-2 py-1 bg-gray-800 text-white text-sm w-full"
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-400">No students found.</div>
        )}
      </div>
    </div>
  </div>
</main>


  );
};

export default AttendancePage;
