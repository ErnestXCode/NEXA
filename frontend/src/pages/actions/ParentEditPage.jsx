// src/pages/personnel/ParentEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ParentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch parent
  const {
    data: parentData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["parent", id],
    queryFn: async () => {
      const res = await api.get(`/personel/parent/${id}`);
      return res.data;
    },
  });

  const [parent, setParent] = useState(null);

  useEffect(() => {
    if (parentData) {
      setParent(parentData);
    }
  }, [parentData]);

  const updateMutation = useMutation({
    mutationFn: (updatedData) => api.put(`/personel/edit/${id}`, updatedData),
    onSuccess: () => {
      queryClient.refetchQueries(["parents"]);
      queryClient.refetchQueries(["parent", id]);
      navigate("/dashboard/parents");
    },
  });

  if (isLoading)
    return <p className="text-white p-6">Loading parent data...</p>;
  if (isError)
    return <p className="text-red-500 p-6">❌ Error fetching parent data</p>;
  if (!parent) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParent((prev) => ({ ...prev, [name]: value }));
  };

  const handleChildChange = (index, value) => {
    const updatedChildren = [...parent.children];
    updatedChildren[index] = value;
    setParent((prev) => ({ ...prev, children: updatedChildren }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(parent);
  };

  console.log(parent)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-lg font-semibold text-white mb-4">
          Edit Parent
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Name"
            name="name"
            value={parent.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="Email"
            name="email"
            value={parent.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="Phone Number"
            name="phoneNumber"
            value={parent.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />

          {/* Role is displayed but not editable */}
          <input
            value="parent"
            disabled
            className="w-full p-2 rounded bg-gray-700 text-gray-400 text-sm cursor-not-allowed"
          />

          {/* Children */}
          <label className="block text-gray-300 mt-2 mb-1">Children</label>
          {parent.children && parent.children.length > 0 ? (
            parent.children.map((child, idx) => (
              <input
                key={idx}
                value={`${child.firstName} ${child.lastName}`}
                disabled
                className="w-full p-2 mb-1 rounded bg-gray-800 text-gray-300 text-sm cursor-not-allowed"
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No children assigned</p>
          )}

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

export default ParentEditPage;
