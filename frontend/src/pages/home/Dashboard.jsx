import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const currentUser = useSelector(selectCurrentUser);

  const [teachers, setTeachers] = useState([]);
  const [bursars, setBursars] = useState([]);
  const [students, setStudents] = useState([]);

  const [teachersLength, setTeachersLength] = useState(0);
  const [bursarsLength, setBursarsLength] = useState(0);
  const [studentsLength, setStudentsLength] = useState(0);

  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const teachersRes = await api.get("/personel/teacher");
        const bursarsRes = await api.get("/personel/bursar");
        const studentsRes = await api.get("/students");
        setTeachers(teachersRes.data.slice(0, 3));
        setBursars(bursarsRes.data.slice(0, 3));
        setStudents(studentsRes.data.slice(0, 3));
        setTeachersLength(teachersRes.data.length);
        setBursarsLength(bursarsRes.data.length);
        setStudentsLength(studentsRes.data.length);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllTeachers();
  }, []);

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Only display stats here */}
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          Students: {studentsLength}
        </div>
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          Teachers: {teachersLength}
        </div>
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          Bursars: {bursarsLength}
        </div>
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          Outstanding Fees: Ksh 120,000
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teachers */}
        <section className="bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Manage Teachers</h2>

          <div className="flex justify-between items-center mb-4">
            <Link
              to="/dashboard/createPersonel"
              className="bg-white text-black px-4 py-2 rounded"
            >
              + Add Teacher
            </Link>
            <Link to="/dashboard/teachers" className="text-blue-400">
              View All
            </Link>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((teacher, i) => (
                  <tr
                    key={teacher._id || i}
                    className={`${
                      i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                    } hover:bg-gray-800 transition`}
                  >
                    <td className="py-2 px-4">{teacher.name}</td>
                    <td className="py-2 px-4">{teacher.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-6 text-gray-400">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Students */}
        <section className="bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Manage Students</h2>
          <div className="flex justify-between items-center mb-4">
            <Link
              to="/dashboard/createStudent"
              className="bg-white text-black px-4 py-2 rounded"
            >
              + Add Student
            </Link>
            <Link to="/dashboard/students" className="text-blue-400">
              View All
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left">Admission #</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Gender</th>
                <th className="py-3 px-4 text-left">DOB</th>
                <th className="py-3 px-4 text-left">Class</th>
                <th className="py-3 px-4 text-left">Guardian</th>
                <th className="py-3 px-4 text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, i) => (
                  <tr
                    key={student.admissionNumber}
                    className={`${
                      i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                    } hover:bg-gray-800 transition`}
                  >
                    <td className="py-2 px-4">{student.admissionNumber}</td>
                    <td className="py-2 px-4">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="py-2 px-4">{student.gender}</td>
                    <td className="py-2 px-4">{student.dateOfBirth}</td>
                    <td className="py-2 px-4">{student.classLevel}</td>
                    <td className="py-2 px-4">{student.guardianName}</td>
                    <td className="py-2 px-4">{student.guardianPhone}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Bursars */}
        <section className="bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Manage Bursars</h2>

          <div className="flex justify-between items-center mb-4">
            <Link
              to="/dashboard/createPersonel"
              className="bg-white text-black px-4 py-2 rounded"
            >
              + Add Bursar
            </Link>
            <Link to="/dashboard/bursars" className="text-blue-400">
              View All
            </Link>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {bursars.length > 0 ? (
                bursars.map((bursar, i) => (
                  <tr
                    key={bursar._id || i}
                    className={`${
                      i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                    } hover:bg-gray-800 transition`}
                  >
                    <td className="py-2 px-4">{bursar.name}</td>
                    <td className="py-2 px-4">{bursar.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-6 text-gray-400">
                    No bursars found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* Recent Activity */}
      <section className="mt-8 bg-gray-900 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ New student John Doe registered</li>
          <li>💰 Payment of Ksh 15,000 recorded</li>
          <li>👩‍🏫 Teacher Mary added</li>
        </ul>
      </section>
    </main>
  );
};

export default Dashboard;
