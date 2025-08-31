// src/pages/personnel/AllTeachers.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchTeachers = async () => {
  const res = await api.get("/personel/teacher");
  return res.data;
};

const deleteTeacher = async (id) => {
  await api.delete(`/personel/teacher/${id}`);
  return id;
};

const AllTeachers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // Fetch teachers
  const {
    data: teachers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });

  // Delete mutation
  const mutation = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries(["teachers"]);
      setShowModal(false);
      setTeacherToDelete(null);
    },
  });

  const confirmDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (teacherToDelete) {
      mutation.mutate(teacherToDelete._id);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setTeacherToDelete(null);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/personnel/edit/${id}`);
  };

  return (
    <main className="p-6 bg-gray-950 min-h-screen relative">
      <h1 className="text-2xl font-bold mb-4 text-white">All Teachers</h1>

      {isLoading && (
        <p className="text-gray-400">Loading teachers...</p>
      )}
      {isError && (
        <p className="text-red-500">❌ Failed to fetch teachers</p>
      )}

      {!isLoading && !isError && (
        <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left text-white">Name</th>
              <th className="p-2 text-left text-white">Email</th>
              <th className="p-2 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? (
              teachers.map((t, i) => (
                <tr
                  key={t._id || i}
                  className={`${
                    i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                  } hover:bg-gray-850 transition`}
                >
                  <td className="p-2 text-white">{t.name}</td>
                  <td className="p-2 text-white">{t.email}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(t._id)}
                      className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(t)}
                      className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-400">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && teacherToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold text-white mb-4">
              Delete Teacher
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{teacherToDelete.name}</span>?
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
                disabled={mutation.isLoading}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition"
              >
                {mutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AllTeachers;
