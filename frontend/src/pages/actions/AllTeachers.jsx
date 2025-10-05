// src/pages/personnel/AllTeachers.jsx
import React, { useState, useMemo } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: teachers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });

  const mutation = useMutation({
    mutationFn: deleteTeacher,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["teachers"] });
      const previousTeachers = queryClient.getQueryData(["teachers"]);
      queryClient.setQueryData(["teachers"], (old = []) =>
        old.filter((b) => b._id !== id)
      );
      return { previousTeachers };
    },
    onError: (err, id, context) => {
      if (context?.previousTeachers) {
        queryClient.setQueryData(["teachers"], context.previousTeachers);
      }
    },
    onSuccess: () => {
      setShowModal(false);
      setTeacherToDelete(null);
    },
    onSettled: () => {
      queryClient.refetchQueries(["teachers"]);
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

  // Filter teachers by name
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  return (
    <main className="p-6 bg-gray-950 overfow-y-hidden relative">
      <h1 className="text-2xl font-bold mb-4 text-white">All Teachers</h1>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && <p className="text-gray-400">Loading teachers...</p>}
      {isError && <p className="text-red-500">❌ Failed to fetch teachers</p>}

      {!isLoading && !isError && (
        <div className="w-full bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left text-white">Name</th>
                <th className="p-2 text-left text-white">Email</th>
                <th className="p-2 text-left text-white">Phone</th>
                <th className="p-2 text-left text-white">Subjects</th>
                <th className="p-2 text-left text-white">Class Teacher?</th>
                <th className="p-2 text-left text-white">Class Level</th>
                <th className="p-2 text-left text-white">Actions</th>
              </tr>
            </thead>
          </table>

          {/* Scrollable table body */}
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm table-fixed">
              <tbody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((t, i) => (
                    <tr
                      key={t._id || i}
                      className={`${
                        i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                      } hover:bg-gray-850 transition`}
                    >
                      <td className="p-2 text-white">{t.name}</td>
                      <td className="p-2 text-white">
                        {t.email ? (
                          <a
                            href={`mailto:${t.email}`}
                            className="text-blue-400 hover:underline hover:text-blue-300"
                          >
                            {t.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-2 text-white">
                        {t.phoneNumber ? (
                          <a
                            href={`tel:${t.phoneNumber}`}
                            className="text-blue-400 hover:underline hover:text-blue-300"
                          >
                            {t.phoneNumber}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-2">
                        {t.subjects && t.subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {t.subjects.map((subj, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs font-medium truncate"
                                style={{ minWidth: "50px" }}
                                title={subj} // shows full subject on hover
                              >
                                {subj}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-2 text-white">
                        {t.isClassTeacher ? "Yes" : "No"}
                      </td>
                      <td className="p-2 text-white">
                        {t.isClassTeacher && t.classLevel ? t.classLevel : "-"}
                      </td>
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
                    <td colSpan="7" className="text-center p-4 text-gray-400">
                      No teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
