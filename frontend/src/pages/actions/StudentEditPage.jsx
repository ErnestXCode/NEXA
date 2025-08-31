import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const StudentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch student
  const { data: student, isLoading, isError } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const res = await api.get(`/students/${id}`);
      return res.data;
    },
  });

  // Update student
  const updateMutation = useMutation({
    mutationFn: (updatedStudent) => api.put(`/students/${id}`, updatedStudent),
    onSuccess: () => {
      queryClient.refetchQueries(["students"]);
      queryClient.refetchQueries(["student", id]);
      navigate("/dashboard/students");
    },
  });

  if (isLoading)
    return <p className="text-white p-6">Loading student data...</p>;
  if (isError) return <p className="text-red-500 p-6">❌ Error fetching student</p>;

  const handleChange = (e) => {
    queryClient.setQueryData(["student", id], {
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(student);
  };

  return (
    <main className=" min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-lg font-semibold text-white mb-4">Edit Student</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Admission Number"
            name="admissionNumber"
            value={student.admissionNumber}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="First Name"
            name="firstName"
            value={student.firstName}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="Last Name"
            name="lastName"
            value={student.lastName}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <select
            name="gender"
            value={student.gender}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="date"
            name="dateOfBirth"
            value={student.dateOfBirth?.slice(0, 10) || ""}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="Class"
            name="classLevel"
            value={student.classLevel}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="Stream"
            name="stream"
            value={student.stream || ""}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="Guardian Name"
            name="guardianName"
            value={student.guardianName}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="Guardian Phone"
            name="guardianPhone"
            value={student.guardianPhone}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />

          <button
            type="submit"
            className="w-full py-2 rounded bg-white text-black font-medium text-sm hover:bg-gray-200"
          >
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
};

export default StudentEditPage;
