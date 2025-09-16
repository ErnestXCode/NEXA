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
      navigate("/dashboard/parents",  {replace: true});
    },
  });

  if (isLoading)
    return <p className="p-6 text-white">Loading parent data...</p>;
  if (isError)
    return <p className="p-6 text-red-500">❌ Error fetching parent data</p>;
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
    <main className="flex items-center justify-center mt-10 overflow-hidden bg-gray-950">
      <div className="w-full max-w-md p-6 bg-gray-900 rounded-lg shadow-md">
        <h1 className="mb-4 text-lg font-semibold text-white">
          Edit Parent
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Name"
            name="name"
            value={parent.name}
            onChange={handleChange}
            className="w-full p-2 text-sm text-white bg-gray-800 rounded"
          />
          <input
            placeholder="Email"
            name="email"
            value={parent.email}
            onChange={handleChange}
            className="w-full p-2 text-sm text-white bg-gray-800 rounded"
          />
          <input
            placeholder="Phone Number"
            name="phoneNumber"
            value={parent.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 text-sm text-white bg-gray-800 rounded"
          />

          {/* Role is displayed but not editable */}
          <input
            value="parent"
            disabled
            className="w-full p-2 text-sm text-gray-400 bg-gray-700 rounded cursor-not-allowed"
          />

          {/* Children */}
          <label className="block mt-2 mb-1 text-gray-300">Children</label>
          {parent.children && parent.children.length > 0 ? (
            parent.children.map((child, idx) => (
              <input
                key={idx}
                value={`${child.firstName} ${child.lastName}`}
                disabled
                className="w-full p-2 mb-1 text-sm text-gray-300 bg-gray-800 rounded cursor-not-allowed"
              />
            ))
          ) : (
            <p className="text-sm text-gray-400">No children assigned</p>
          )}

          <button
            type="submit"
            className="w-full py-2 text-sm font-medium text-black bg-white rounded hover:bg-gray-200"
          >
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
};

export default ParentEditPage;
