// src/pages/personnel/ParentForm.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const initialParent = {
  name: "",
  email: "",
  password: "",
  confirmPass: "",
  children: [], // array of student IDs
};

const ParentForm = () => {
  const [parentDetails, setParentDetails] = useState(initialParent);
  const [canRegister, setCanRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  const queryClient = useQueryClient();

  // 🔹 Fetch students for selection
  const { data: students = [] } = useQuery({
    queryKey: ["studentsForParent"],
    queryFn: () => api.get("/students").then((res) => res.data),
  });

  // 🔹 Filter students based on search input
  useEffect(() => {
    if (!studentSearch) return setFilteredStudents([]);
    const filtered = students.filter((s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(studentSearch.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [studentSearch, students]);

  // 🔹 Mutation for adding parent
  const addParentMutation = useMutation({
    mutationFn: (data) => api.post("/auth/registerpersonel", { ...data, role: "parent" }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["parents"], exact: true });
    },
  });

  // 🔹 Input change
  const handleChange = (e) => {
  const { name, value } = e.target;
  const updated = { ...parentDetails, [name]: value }; // compute new state

  setParentDetails(updated);

  // Now use updated instead of parentDetails
  setCanRegister(
    updated.name.trim() &&
      updated.email.trim() &&
      updated.password &&
      updated.confirmPass === updated.password
  );
};


  // 🔹 Add student as child
  const addChild = (student) => {
    if (!parentDetails.children.includes(student._id)) {
      setParentDetails((prev) => ({
        ...prev,
        children: [...prev.children, student._id],
      }));
    }
    setStudentSearch("");
    setFilteredStudents([]);
  };

  // 🔹 Remove child
  const removeChild = (id) => {
    setParentDetails((prev) => ({
      ...prev,
      children: prev.children.filter((c) => c !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { confirmPass, ...dataToSend } = parentDetails;
      await addParentMutation.mutateAsync(dataToSend);
      setMessage("✅ Parent added successfully!");
      setParentDetails(initialParent);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 min-h-screen flex justify-center items-start">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col gap-4 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Add Parent</h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              name="name"
              value={parentDetails.name}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800 text-white w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              name="email"
              value={parentDetails.email}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800 text-white w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={parentDetails.password}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800 text-white w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPass"
              value={parentDetails.confirmPass}
              onChange={handleChange}
              className={`p-2 rounded w-full ${
                parentDetails.confirmPass === ""
                  ? "bg-gray-800 text-white"
                  : parentDetails.confirmPass === parentDetails.password
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            />
          </div>

          {/* Children selection */}
          <div>
            <label className="block mb-1">Children</label>
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search student by name"
              className="p-2 rounded bg-gray-800 text-white w-full"
            />
            {filteredStudents.length > 0 && (
              <ul className="bg-gray-800 rounded mt-1 max-h-40 overflow-y-auto">
                {filteredStudents.map((s) => (
                  <li
                    key={s._id}
                    className="p-2 cursor-pointer hover:bg-gray-700"
                    onClick={() => addChild(s)}
                  >
                    {s.firstName} {s.lastName} — {s.classLevel}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {parentDetails.children.map((id) => {
                const student = students.find((s) => s._id === id);
                if (!student) return null;
                return (
                  <span
                    key={id}
                    className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {student.firstName} {student.lastName}
                    <button
                      type="button"
                      onClick={() => removeChild(id)}
                      className="ml-1 text-xs text-red-200 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canRegister}
          className={`mt-4 py-2 rounded font-semibold w-full ${
            canRegister
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-gray-500 cursor-not-allowed"
          }`}
        >
          Add Parent
        </button>

        {message && (
          <p
            className={`${
              message.startsWith("✅") ? "text-green-400" : "text-red-500"
            } mt-3 text-center`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  );
};

export default ParentForm;
