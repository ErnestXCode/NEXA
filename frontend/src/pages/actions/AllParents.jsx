// src/pages/personnel/AllParents.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchParents = async () => {
  const res = await api.get("/personel/parent"); // endpoint to fetch parents
  return res.data;
};

const deleteParent = async (id) => {
  await api.delete(`/personel/parent/${id}`);
  return id;
};

const AllParents = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: parents = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["parents"],
    queryFn: fetchParents,
  });

  const mutation = useMutation({
    mutationFn: deleteParent,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["parents"] });
      const previousParents = queryClient.getQueryData(["parents"]);
      queryClient.setQueryData(["parents"], (old = []) =>
        old.filter((b) => b._id !== id)
      );
      return { previousParents };
    },
    onError: (err, id, context) => {
      if (context?.previousParents) {
        queryClient.setQueryData(["parents"], context.previousParents);
      }
    },
    onSuccess: () => {
      setShowModal(false);
      setParentToDelete(null);
    },
    onSettled: () => {
      queryClient.refetchQueries(["parents"]);
    },
  });

  const confirmDelete = (parent) => {
    setParentToDelete(parent);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (parentToDelete) {
      mutation.mutate(parentToDelete._id);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setParentToDelete(null);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/personnel/edit-parent/${id}`);
  };

  // Filter parents by parent name OR child names
  const filteredParents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return parents.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(term);

      const childrenMatch =
        p.children &&
        p.children.some((c) => {
          const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
          return fullName.includes(term);
        });

      return nameMatch || childrenMatch;
    });
  }, [parents, searchTerm]);

  return (
    <main className="p-6 bg-gray-950 min-h-screen relative">
      <h1 className="text-2xl font-bold mb-4 text-white">All Parents</h1>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by parent or child name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && <p className="text-gray-400">Loading parents...</p>}
      {isError && <p className="text-red-500">❌ Failed to fetch parents</p>}

      {!isLoading && !isError && (
        <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left text-white">Name</th>
              <th className="p-2 text-left text-white">Email</th>
              <th className="p-2 text-left text-white">Phone</th>
              <th className="p-2 text-left text-white">Children</th>
              <th className="p-2 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParents.length > 0 ? (
              filteredParents.map((p, i) => (
                <tr
                  key={p._id || i}
                  className={`${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"} hover:bg-gray-850 transition`}
                >
                  <td className="p-2 text-white">{p.name}</td>
                  <td className="p-2 text-white">{p.email}</td>
                  <td className="p-2 text-white">{p.phoneNumber}</td>
                  <td className="p-2 text-white">
                    {p.children && p.children.length > 0
                      ? p.children.map((c) => `${c.firstName} ${c.lastName}`).join(", ")
                      : "-"}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(p._id)}
                      className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(p)}
                      className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-400">
                  No parents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Delete Modal */}
      {showModal && parentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold text-white mb-4">Delete Parent</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{parentToDelete.name}</span>?
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

export default AllParents;
