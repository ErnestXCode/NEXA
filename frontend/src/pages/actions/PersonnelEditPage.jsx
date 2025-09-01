import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PersonnelEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch personnel
  const { data: personnel, isLoading, isError } = useQuery({
    queryKey: ["personnel", id],
    queryFn: async () => {
      const res = await api.get(`/personel/id/${id}`);
      return res.data;
    },
  });

  // Update personnel
  const updateMutation = useMutation({
    mutationFn: (updatedData) => api.put(`/personel/edit/${id}`, updatedData),
    onSuccess: () => {
      queryClient.refetchQueries(["teachers"]);
      queryClient.refetchQueries(["bursars"]);
      queryClient.refetchQueries(["personnel", id]);
      navigate("/dashboard");
    },
  });

  if (isLoading)
    return <p className="text-white p-6">Loading personnel data...</p>;
  if (isError)
    return <p className="text-red-500 p-6">❌ Error fetching personnel</p>;

  const handleChange = (e) => {
    queryClient.setQueryData(["personnel", id], {
      ...personnel,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(personnel);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-lg font-semibold text-white mb-4">
          Edit Personnel
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Name"
            name="name"
            value={personnel.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <input
            placeholder="Email"
            name="email"
            value={personnel.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          />
          <select
            name="role"
            value={personnel.role}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="teacher">Teacher</option>
            <option value="bursar">Bursar</option>
            <option value="admin">Admin</option>
          </select>
          {/* <input
            type="password"
            placeholder="Password (leave blank to keep)"
            name="password"
            value={personnel.password || ""}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm"
          /> */}

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

export default PersonnelEditPage;
