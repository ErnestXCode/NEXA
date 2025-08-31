import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchBursars = async () => {
  const res = await api.get("/personel/bursar");
  return res.data;
};

const deleteBursar = async (id) => {
  await api.delete(`/personel/bursar/${id}`);
};

const AllBursars = () => {
  const [showModal, setShowModal] = useState(false);
  const [bursarToDelete, setBursarToDelete] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for fetching bursars
  const { data: bursars = [], isLoading, isError } = useQuery({
    queryKey: ["bursars"],
    queryFn: fetchBursars,
  });

  // Mutation for deleting bursar
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBursar(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["bursars"]);
      setShowModal(false);
      setBursarToDelete(null);
    },
  });

  const confirmDelete = (bursar) => {
    setBursarToDelete(bursar);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (bursarToDelete) {
      deleteMutation.mutate(bursarToDelete._id);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setBursarToDelete(null);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/personnel/edit/${id}`);
  };

  if (isLoading) {
    return (
      <main className="p-6 bg-gray-950 min-h-screen text-white">
        <p>Loading bursars...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 bg-gray-950 min-h-screen text-white">
        <p>❌ Failed to load bursars.</p>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-950 min-h-screen relative">
      <h1 className="text-2xl font-bold mb-4 text-white">All Bursars</h1>
      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left text-white">Name</th>
            <th className="p-2 text-left text-white">Email</th>
            <th className="p-2 text-left text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bursars.length > 0 ? (
            bursars.map((b, i) => (
              <tr
                key={b._id || i}
                className={`${
                  i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                } hover:bg-gray-850 transition`}
              >
                <td className="p-2 text-white">{b.name}</td>
                <td className="p-2 text-white">{b.email}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(b._id)}
                    className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(b)}
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
                No bursars found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && bursarToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold text-white mb-4">Delete Bursar</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{bursarToDelete.name}</span>?
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

export default AllBursars;
