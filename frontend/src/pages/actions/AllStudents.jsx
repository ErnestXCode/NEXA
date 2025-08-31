import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

const deleteStudent = async (id) => {
  await api.delete(`/students/${id}`);
};

const AllStudents = () => {
  const [showModal, setShowModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for fetching students
  const {
    data: students = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  // Mutation for deleting student
 const deleteMutation = useMutation({
  mutationFn: (id) => deleteStudent(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ["students"] });
    const previousStudents = queryClient.getQueryData(["students"]);
    queryClient.setQueryData(["students"], (old = []) =>
      old.filter((b) => b._id !== id)
    );
    return { previousStudents };
  },
  onError: (err, id, context) => {
    if (context?.previousStudents) {
      queryClient.setQueryData(["students"], context.previousStudents);
    }
  },
  onSuccess: () => {
    // close modal
    setShowModal(false);
    setStudentToDelete(null);
  },
  onSettled: () => {
    // refetch to sync server and cache
    queryClient.refetchQueries(["students"]);
  },
});


  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete._id);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setStudentToDelete(null);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/students/edit/${id}`);
  };

  if (isLoading) {
    return (
      <main className="p-6 bg-gray-950 min-h-screen text-white">
        <p>Loading students...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 bg-gray-950 min-h-screen text-white">
        <p>❌ Failed to load students.</p>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-950 min-h-screen relative">
      <h1 className="text-2xl font-bold mb-4 text-white">All Students</h1>
      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left text-white">Admission #</th>
            <th className="p-2 text-left text-white">Name</th>
            <th className="p-2 text-left text-white">Gender</th>
            <th className="p-2 text-left text-white">DOB</th>
            <th className="p-2 text-left text-white">Class</th>
            <th className="p-2 text-left text-white">Guardian</th>
            <th className="p-2 text-left text-white">Phone</th>
            <th className="p-2 text-left text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s, i) => (
              <tr
                key={s._id || i}
                className={`${
                  i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                } hover:bg-gray-850 transition`}
              >
                <td className="p-2 text-white">{s.admissionNumber}</td>
                <td className="p-2 text-white">
                  {s.firstName} {s.lastName}
                </td>
                <td className="p-2 text-white">{s.gender}</td>
                <td className="p-2 text-white">{s.dateOfBirth}</td>
                <td className="p-2 text-white">{s.classLevel}</td>
                <td className="p-2 text-white">{s.guardianName}</td>
                <td className="p-2 text-white">{s.guardianPhone}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(s._id)}
                    className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(s)}
                    className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center p-4 text-gray-400">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold text-white mb-4">
              Delete Student
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {studentToDelete.firstName} {studentToDelete.lastName}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition"
              >
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AllStudents;
