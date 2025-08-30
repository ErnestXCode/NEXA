import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";

const Dashboard = () => {
  const currentUser = useSelector(selectCurrentUser);

  const [teachers, setTeachers] = useState([]);
  const [bursars, setBursars] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachersLength, setTeachersLength] = useState(0);
  const [bursarsLength, setBursarsLength] = useState(0);
  const [studentsLength, setStudentsLength] = useState(0);
  const [outstandingFees, setOutstandingFees] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, bursarsRes, studentsRes] = await Promise.all([
          api.get("/personel/teacher"),
          api.get("/personel/bursar"),
          api.get("/students"),
        ]);

        setTeachers(teachersRes.data.slice(0, 3));
        setBursars(bursarsRes.data.slice(0, 3));
        setStudents(studentsRes.data.slice(0, 12));
        setTeachersLength(teachersRes.data.length);
        setBursarsLength(bursarsRes.data.length);
        setStudentsLength(studentsRes.data.length);

        const feesRes = await api.get("/fees/outstanding");
        setOutstandingFees(feesRes.data.totalOutstanding);

        const activityRes = await api.get("/activity");
        setRecentActivities(activityRes.data.slice(0, 5)); // latest 5
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen space-y-8">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Students", value: studentsLength },
          { label: "Teachers", value: teachersLength },
          { label: "Bursars", value: bursarsLength },
          {
            label: "Outstanding Fees",
            value: `Ksh ${outstandingFees.toLocaleString()}`,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 flex flex-col justify-center items-center text-center hover:bg-gray-850 transition"
          >
            <p className="text-gray-400 text-sm uppercase mb-2">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Management Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers */}
        <ManagementTable
          title="Manage Teachers"
          data={teachers}
          columns={["Name", "Email"]}
          viewAllLink="/dashboard/teachers"
          addLink="/dashboard/createPersonel"
          addText="+ Add Teacher"
          rowRender={(teacher) => [teacher.name, teacher.email]}
        />

        {/* Students - span 2 rows */}
        <div className="lg:row-span-2">
          <ManagementTable
            title="Manage Students"
            data={students}
            columns={["Admission #", "Name", "Gender", "Class", "Phone"]}
            viewAllLink="/dashboard/students"
            addLink="/dashboard/createStudent"
            addText="+ Add Student"
            rowRender={(student) => [
              student.admissionNumber,
              `${student.firstName} ${student.lastName}`,
              student.gender,
              student.classLevel,
              student.guardianPhone,
            ]}
          />
        </div>

        {/* Bursars */}
        <ManagementTable
          title="Manage Bursars"
          data={bursars}
          columns={["Name", "Email"]}
          viewAllLink="/dashboard/bursars"
          addLink="/dashboard/createPersonel"
          addText="+ Add Bursar"
          rowRender={(bursar) => [bursar.name, bursar.email]}
        />
      </div>

      {/* Recent Activities */}
      <section className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <ul className="space-y-3 text-sm">
          {recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <li
                key={act._id}
                className="p-3 bg-gray-850 rounded flex justify-between items-center border border-gray-800 hover:bg-gray-800 transition"
              >
                <span>{act.description}</span>
                <span className="text-gray-400 text-xs">
                  {new Date(act.date).toLocaleString()}
                </span>
              </li>
            ))
          ) : (
            <li className="text-gray-400">No recent activity</li>
          )}
        </ul>
      </section>
    </main>
  );
};

export default Dashboard;

// Reusable Management Table Component
const ManagementTable = ({
  title,
  data,
  columns,
  viewAllLink,
  addLink,
  addText,
  rowRender,
}) => (
  <section className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <div className="flex justify-between items-center mb-4">
      <Link
        to={addLink}
        className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        {addText}
      </Link>
      <Link to={viewAllLink} className="text-blue-400 hover:underline">
        View All
      </Link>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-800">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="py-3 px-4 text-left border-b border-gray-700"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                } hover:bg-gray-850 transition`}
              >
                {rowRender(row).map((val, j) => (
                  <td key={j} className="py-2 px-4 border-b border-gray-800">
                    {val}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-gray-400"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);
