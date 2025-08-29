import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";

// const studentObj = {
//   admissionNumber: "",
//   firstName: "",
//   lastName: "",
//   gender: "",
//   dateOfBirth: "",
//   classLevel: "",
// //   stream: "",
// //   subjects: "",
//   guardianName: "",
//   guardianPhone: "",
// //   guardianEmail: "",
// //   relationship: "",
// //   feeBalance: "",
// //   examResults: "",
// //   status: "",
// };

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
  const [studentDetails, setStudentDetails] = useState(studentObj);
  const [canAddStudent, setCanAddStudent] = useState(false);

  const handleChange = (e) => {
    const updatedDetails = {
      ...studentDetails,
      [e.target.name]: e.target.value,
    };

    setStudentDetails(updatedDetails);

    if (Object.values(updatedDetails).every((val) => val !== "")) {
      setCanAddStudent(true);
    } else {
      setCanAddStudent(false);
    }
  };

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/students`,
        studentDetails,
        {
          withCredentials: true,
        }
      );
      console.log('response', response)

      setMessage("✅ Student added successfully!");
      // maybe redirect after a short timeout
      // console.log(response);
      // dispatch(setCredentials(response.data));
      // its replacing admin stuff with those personel bad thing'
      // setStudentDetails(studentObj)
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <>
      <main>
        <form
          className="flex flex-col bg-gray-950 p-3 w-[500px]"
          onSubmit={handleSubmit}
        >
          {/* <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            onChange={handleChange}
            value={studentDetails.role}
            className="bg- mb-3 mt-1 px-3 py-2 border border-gray-300 rounded appearance-none"
            defaultValue="" // Optional: empty default
          >
            <option className="bg-black" value="" disabled>
              Select role
            </option>
            <option className="bg-black" value="teacher">
              Teacher
            </option>
            <option className="bg-black" value="bursar">
              Bursar
            </option>
          </select> */}
          <label htmlFor="admissionNumber">Admission number</label>
          <input
            className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
            type="number"
            onChange={handleChange}
            value={studentDetails.admissionNumber}
            name="admissionNumber"
            id="admissionNumber"
          />
          <label htmlFor="firstName">First Name</label>
          <input
            className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
            type="text"
            onChange={handleChange}
            value={studentDetails.firstName}
            name="firstName"
            id="firstName"
          />
          <label htmlFor="lastName">Last name</label>
          <input
            className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
            type="text"
            onChange={handleChange}
            value={studentDetails.lastName}
            name="lastName"
            id="lastName"
          />
          <label htmlFor="gender">Gender</label>
          <input
            className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
            type="text"
            onChange={handleChange}
            value={studentDetails.gender}
            name="gender"
            id="gender"
          />
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input
            className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
            type="date"
            onChange={handleChange}
            value={studentDetails.dateOfBirth}
            name="dateOfBirth"
            id="dateOfBirth"
          />
          <label htmlFor="classLevel">Class level</label>
          <input
            className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
            type="text"
            onChange={handleChange}
            value={studentDetails.classLevel}
            name="classLevel"
            id="classLevel"
          />
          <label htmlFor="guardianName">Guardian's name</label>
          <input
            className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
            type="text"
            onChange={handleChange}
            value={studentDetails.guardianName}
            name="guardianName"
            id="guardianName"
          />
          <label htmlFor="guardianPhone">Guardian's Phone number</label>
          <input
            className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
            type="text"
            onChange={handleChange}
            value={studentDetails.guardianPhone}
            name="guardianPhone"
            id="guardianPhone"
          />

          <button
            className={`bg-gray-50 w-fit ml-auto mr-auto text-black font-semibold p-1 mt-1 pl-2 pr-2 disabled:bg-gray-500 ${
              canAddStudent && "hover:scale-95 hover:cursor-pointer"
            }`}
            // disabled={!canAddStudent}
          >
            Add personel
          </button>
          {message && (
            <p
              className={`mt-3 text-center font-semibold ${
                message.startsWith("✅") ? "text-green-400" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </main>
    </>
  );
};

export default StudentForm;
