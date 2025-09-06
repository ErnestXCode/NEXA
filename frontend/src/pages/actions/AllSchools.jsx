import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch all schools
const fetchSchools = async () => {
  const res = await api.get("/schools");
  return res.data;
};

// Delete a school
const deleteSchool = async (id) => {
  await api.delete(`/schools/${id}`);
};

const AllSchools = () => {
  const [showModal, setShowModal] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: schools = [], isLoading, isError } = useQuery({
    queryKey: ["schools"],
    queryFn: fetchSchools,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchool,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["schools"] });
      const previousSchools = queryClient.getQueryData(["schools"]);
      queryClient.setQueryData(["schools"], (old = []) =>
        old.filter((s) => s._id !== id)
      );
      return { previousSchools };
    },
    onError: (err, id, context) => {
      if (context?.previousSchools) {
        queryClient.setQueryData(["schools"], context.previousSchools);
      }
    },
    onSuccess: () => {
      setShowModal(false);
      setSchoolToDelete(null);
    },
    onSettled: () => {
      queryClient.refetchQueries(["schools"]);
    },
  });

  const confirmDelete = (school) => {
    setSchoolToDelete(school);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (schoolToDelete) {
      deleteMutation.mutate(schoolToDelete._id);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSchoolToDelete(null);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/schools/edit-school/${id}`);
  };

  const filteredSchools = useMemo(() => {
    return schools.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [schools, searchTerm]);

  if (isLoading) {
    return (
      <main className="p-6 bg-gray-950 min-h-screen text-white">
        <p>Loading schools...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 bg-gray-950 min-h-screen text-white">
        <p>❌ Failed to load schools.</p>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-950 min-h-screen relative">
      <h1 className="text-2xl font-bold mb-4 text-white">All Schools</h1>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by school name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left text-white">Name</th>
            <th className="p-2 text-left text-white">Address</th>
            <th className="p-2 text-left text-white">Phone</th>
            <th className="p-2 text-left text-white">Email</th>
            <th className="p-2 text-left text-white">Class Levels</th>
            <th className="p-2 text-left text-white">Fee Expectations</th>
            <th className="p-2 text-left text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchools.length > 0 ? (
            filteredSchools.map((s, i) => (
              <tr
                key={s._id || i}
                className={`${
                  i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                } hover:bg-gray-850 transition`}
              >
                <td className="p-2 text-white">{s.name}</td>
                <td className="p-2 text-white">{s.address || "-"}</td>
                <td className="p-2 text-white">{s.phone || "-"}</td>
                <td className="p-2 text-white">{s.email || "-"}</td>
                <td className="p-2 text-white">{s.classLevels?.length || 0}</td>
                <td className="p-2 text-white">{s.feeExpectations?.length || 0}</td>
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
              <td colSpan="7" className="text-center p-4 text-gray-400">
                No schools found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Delete Modal */}
      {showModal && schoolToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold text-white mb-4">Delete School</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{schoolToDelete.name}</span>?
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

export default AllSchools;
