import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const AdminDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);
  // ================= Queries =================
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

  const activityQuery = useQuery({
    queryKey: ["activities"],
    queryFn: () => api.get("/activity").then((res) => res.data),
  });
  const activities = useMemo(() => activityQuery.data || [], [activityQuery.data]);
  const teachers = useMemo(() => teachersQuery.data || [], [teachersQuery.data]);
  const bursars = useMemo(() => bursarsQuery.data || [], [bursarsQuery.data]);
  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);
  const parents = useMemo(() => parentsQuery.data || [], [parentsQuery.data]);


  const GENDER_COLORS = ["#22d3ee", "#f43f5e"];
  const genderData = useMemo(() => {
    const males = students.filter((s) => s.gender === "male").length;
    const females = students.filter((s) => s.gender === "female").length;
    return [
      { name: "Male", value: males },
      { name: "Female", value: females },
    ];
  }, [students]);
  
 const studentsPerClass = useMemo(() => {
  // count students per class
  const counts = {};
  students.forEach((s) => {
    const cls = s.classLevel || "Unassigned";
    counts[cls] = (counts[cls] || 0) + 1;
  });

  // dynamically get all unique classes from students data
  const allClasses = Array.from(new Set(students.map((s) => s.classLevel || "Unassigned")));

  // map to chart data, ensuring each class appears
  return allClasses.map((cls) => ({
    class: cls,
    count: counts[cls] || 0,
  }));
}, [students]);
;
  
  const teachersPerSubject = useMemo(() => {
    const counts = {};
    teachers.forEach((t) => {
      (t.subjects || []).forEach((subj) => {
        counts[subj] = (counts[subj] || 0) + 1;
      });
    });
    return Object.keys(counts).map((subj) => ({
      subject: subj,
      count: counts[subj],
    }));
  }, [teachers]);
  
  const activitiesTrend = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();
  
    const counts = last7Days.map((date) => ({
      date,
      count: activities.filter(
        (a) => new Date(a.date).toISOString().split("T")[0] === date
      ).length,
    }));
  
    return counts;
  }, [activities]);


  if (
    teachersQuery.isLoading ||
    bursarsQuery.isLoading ||
    studentsQuery.isLoading ||
    parentsQuery.isLoading ||
    activityQuery.isLoading
  ) {
    return <p className="p-6 text-gray-400">Loading dashboard...</p>;
  }

  if (
    teachersQuery.isError ||
    bursarsQuery.isError ||
    studentsQuery.isError ||
    parentsQuery.isError ||
    activityQuery.isError
  ) {
    return <p className="p-6 text-red-500">❌ Error loading dashboard data</p>;
  }

  // ================= Derived Data =================
  


  const teachersLength = teachers.length;
  const bursarsLength = bursars.length;
  const studentsLength = students.length;
  const parentsLength = parents.length;

  const recentActivities = activities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);


  const COLORS = ["#22d3ee", "#4ade80", "#facc15", "#f43f5e", "#a855f7"];

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen space-y-10">
      {/* ================= Summary Cards ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {[
          { label: "Students", value: studentsLength },
          { label: "Teachers", value: teachersLength },
          { label: "Bursars", value: bursarsLength },
          { label: "Parents", value: parentsLength },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 flex flex-col justify-center items-center text-center hover:bg-gray-850 hover:scale-105 transition-transform duration-300"
          >
            <p className="text-gray-400 text-sm uppercase mb-2">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ================= Management Tables ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ManagementTable
            title="Manage Teachers"
            data={teachers.slice(0, 3)}
            columns={[
              "Name",
              "Email",
              "Phone",
              "Subjects",
              "Class Teacher?",
              "Class Level",
            ]}
            viewAllLink="/dashboard/teachers"
            addLink="/dashboard/createPersonel"
            addText="+ Add Teacher"
            minHeight="min-h-[350px]"
            rowRender={(teacher) => [
              teacher.name,
              teacher.email,
              teacher.phoneNumber || "-",
              teacher.subjects && teacher.subjects.length > 0
                ? teacher.subjects.length > 1
                  ? `${teacher.subjects[0]}...`
                  : teacher.subjects[0]
                : "-",
              teacher.isClassTeacher ? "Yes" : "No",
              teacher.isClassTeacher && teacher.classLevel
                ? teacher.classLevel
                : "-",
            ]}
          />

          <ManagementTable
            title="Manage Bursars"
            data={bursars.slice(0, 3)}
            columns={["Name", "Email", "Phone"]}
            viewAllLink="/dashboard/bursars"
            addLink="/dashboard/createPersonel"
            addText="+ Add Bursar"
            minHeight="min-h-[300px]"
            rowRender={(bursar) => [
              bursar.name,
              bursar.email,
              bursar.phoneNumber || "-",
            ]}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ManagementTable
            title="Manage Students"
            data={students.slice(0, 3)}
            columns={["Name", "Gender", "Class", "Phone"]}
            viewAllLink="/dashboard/students"
            addLink="/dashboard/createStudent"
            addText="+ Add Student"
            minHeight="min-h-[350px]"
            rowRender={(student) => [
              `${student.firstName} ${student.middleName} ${student.lastName}`,
              student.gender,
              student.classLevel,
              student.guardian?.phoneNumber || "-",
            ]}
          />

          <ManagementTable
            title="Manage Parents"
            data={parents.slice(0, 3)}
            columns={["Name", "Email", "Phone"]}
            viewAllLink="/dashboard/parents"
            addLink="/dashboard/createParent"
            addText="+ Add Parent"
            minHeight="min-h-[300px]"
            rowRender={(parent) => [
              parent.name,
              parent.email,
              parent.phoneNumber,
            ]}
          />
        </div>
      </div>

      {/* ================= Charts Section ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[{
          title: "Students by Gender",
          content: (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ),
        },{
          title: "Students per Class",
          content: (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studentsPerClass}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
             <XAxis dataKey="class" stroke="#bbb" interval={0} angle={-30} textAnchor="end"/>

                <YAxis stroke="#bbb"/>
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          ),
        },{
          title: "Teachers per Subject",
          content: (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={teachersPerSubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                <XAxis dataKey="subject" interval={0} angle={-30} textAnchor="end" stroke="#bbb"/>
                <YAxis stroke="#bbb"/>
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          ),
        },{
          title: "Activities Trend (Last 7 Days)",
          content: (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activitiesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
                <XAxis dataKey="date" stroke="#bbb"/>
                <YAxis allowDecimals={false} stroke="#bbb"/>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={2}/>
              </LineChart>
            </ResponsiveContainer>
          ),
        }].map((chart,i)=>(
          <div key={i} className="bg-gray-900 p-4 rounded-2xl shadow-lg border border-gray-800">
            <h3 className="text-lg font-semibold mb-2">{chart.title}</h3>
            {chart.content}
          </div>
        ))}
      </div>

      {/* ================= Recent Activities ================= */}
      <section className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
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

export default AdminDashboard;

// ================= Management Table =================
const ManagementTable = ({
  title,
  data,
  columns,
  viewAllLink,
  addLink,
  addText,
  rowRender,
  minHeight,
}) => (
  <section
    className={`bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 ${minHeight}`}
  >
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <div className="flex justify-between items-center mb-4">
      <Link
        to={addLink}
        className="bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-100 transition"
      >
        {addText}
      </Link>
      <Link
        to={viewAllLink}
        className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition"
      >
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
