import React, { useState } from "react";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";

const studentObj = {
  admissionNumber: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  classLevel: "",
  guardianName: "",
  guardianPhone: "",
};

const StudentForm = () => {
  const [student, setStudent] = useState(studentObj);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/students", student, { withCredentials: true });
      setMessage("✅ Student added successfully!");
      setStudent(studentObj);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <>
  
      <main className="p-6 bg-gray-950 min-h-screen flex justify-center items-start">
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg w-[500px] flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-white">Add Student</h1>

          <input
            placeholder="Admission Number"
            name="admissionNumber"
            value={student.admissionNumber}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
          <input
            placeholder="First Name"
            name="firstName"
            value={student.firstName}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
          <input
            placeholder="Last Name"
            name="lastName"
            value={student.lastName}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
          <select
            name="gender"
            value={student.gender}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="date"
            name="dateOfBirth"
            value={student.dateOfBirth}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
          <input
            placeholder="Class"
            name="classLevel"
            value={student.classLevel}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
          <input
            placeholder="Guardian Name"
            name="guardianName"
            value={student.guardianName}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
          <input
            placeholder="Guardian Phone"
            name="guardianPhone"
            value={student.guardianPhone}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />

          <button
            type="submit"
            className="py-2 rounded font-semibold bg-white text-black hover:bg-gray-200"
          >
            Add Student
          </button>
          {message && (
            <p className={`${message.startsWith("✅") ? "text-green-400" : "text-red-500"} mt-2`}>
              {message}
            </p>
          )}
        </form>
      </main>
    </>
  );
};

export default StudentForm;
