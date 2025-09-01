// src/pages/dashboard/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const Dashboard = () => {
  const currentUser = useSelector(selectCurrentUser);

  // Queries
  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => api.get("/personel/teacher").then((res) => res.data),
  });

  const bursarsQuery = useQuery({
    queryKey: ["bursars"],
    queryFn: () => api.get("/personel/bursar").then((res) => res.data),
  });

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get("/students").then((res) => res.data),
  });

  const parentsQuery = useQuery({
    queryKey: ["parents"],
    queryFn: () => api.get("/personel/parent").then((res) => res.data),
  });

  const feesQuery = useQuery({
    queryKey: ["feesOutstanding"],
    queryFn: () => api.get("/fees/outstanding").then((res) => res.data),
  });

  const activityQuery = useQuery({
    queryKey: ["activities"],
    queryFn: () => api.get("/activity").then((res) => res.data),
  });

  // Derived values
  const teachers = teachersQuery.data?.slice(0, 3) || [];
  const bursars = bursarsQuery.data?.slice(0, 3) || [];
  const students = studentsQuery.data?.slice(0, 3) || [];
  const parents = parentsQuery.data?.slice(0, 3) || [];

  const teachersLength = teachersQuery.data?.length || 0;
  const bursarsLength = bursarsQuery.data?.length || 0;
  const studentsLength = studentsQuery.data?.length || 0;
  const parentsLength = parentsQuery.data?.length || 0;

  const outstandingFees = feesQuery.data?.totalOutstanding || 0;
  const recentActivities = activityQuery.data?.slice(0, 5) || [];

  if (
    teachersQuery.isLoading ||
    bursarsQuery.isLoading ||
    studentsQuery.isLoading ||
    parentsQuery.isLoading ||
    feesQuery.isLoading ||
    activityQuery.isLoading
  ) {
    return <p className="p-6 text-gray-400">Loading dashboard...</p>;
  }

  if (
    teachersQuery.isError ||
    bursarsQuery.isError ||
    studentsQuery.isError ||
    parentsQuery.isError ||
    feesQuery.isError ||
    activityQuery.isError
  ) {
    return <p className="p-6 text-red-500">❌ Error loading dashboard data</p>;
  }

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen space-y-8">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { label: "Students", value: studentsLength },
          { label: "Teachers", value: teachersLength },
          { label: "Bursars", value: bursarsLength },
          { label: "Parents", value: parentsLength },
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

      {/* Management Tables - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ManagementTable
            title="Manage Teachers"
            data={teachers}
            columns={["Name", "Email", "Subjects", "Class Teacher?", "Class Level"]}
            viewAllLink="/dashboard/teachers"
            addLink="/dashboard/createPersonel"
            addText="+ Add Teacher"
            rowRender={(teacher) => [
              teacher.name,
              teacher.email,
              teacher.subjects && teacher.subjects.length > 0
                ? teacher.subjects.join(", ")
                : "-",
              teacher.isClassTeacher ? "Yes" : "No",
              teacher.isClassTeacher && teacher.classLevel ? teacher.classLevel : "-",
            ]}
          />

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

        {/* Right Column */}
        <div className="space-y-6">
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

          <ManagementTable
            title="Manage Parents"
            data={parents}
            columns={["Name", "Email", "Phone"]}
            viewAllLink="/dashboard/parents"
            addLink="/dashboard/createParent"
            addText="+ Add Parent"
            rowRender={(parent) => [parent.name, parent.email, parent.phone]}
          />
        </div>
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
const ManagementTable = ({ title, data, columns, viewAllLink, addLink, addText, rowRender }) => (
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
              <th key={i} className="py-3 px-4 text-left border-b border-gray-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} className={`${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"} hover:bg-gray-850 transition`}>
                {rowRender(row).map((val, j) => (
                  <td key={j} className="py-2 px-4 border-b border-gray-800">{val}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-gray-400">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);
