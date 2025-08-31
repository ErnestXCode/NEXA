import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PersonnelEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  // Fetch personnel using React Query
  const {
    data: personnel,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["personnel", id],
    queryFn: async () => {
      const res = await api.get(`/personel/id/${id}`);
      return res.data;
    },
  });

  // Mutation for updating personnel
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      return api.put(`/personel/edit/${id}`, updatedData);
    },
    onSuccess: () => {
      // update cache directly for this record

      // refresh lists
      queryClient.refetchQueries(["teachers"]);
      queryClient.refetchQueries(["bursars"]);
      queryClient.refetchQueries(["personnel", id]);

      setMessage("✅ Personnel updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Update failed"}`);
    },
  });

  const handleChange = (e) => {
    // Update cache so inputs stay in sync
    queryClient.setQueryData(["personnel", id], {
      ...personnel,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(personnel);
  };

  if (isLoading) return <p className="text-white p-6">Loading...</p>;
  if (error)
    return <p className="text-red-500 p-6">❌ Error fetching personnel data</p>;

  return (
    <main className="p-6 bg-gray-950 min-h-screen flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl grid gap-4 grid-cols-1 md:grid-cols-2"
      >
        <h1 className="text-2xl font-bold text-white col-span-2">
          Edit Personnel
        </h1>

        <input
          placeholder="Name"
          name="name"
          value={personnel?.name || ""}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />
        <input
          placeholder="Email"
          name="email"
          value={personnel?.email || ""}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />
        <select
          name="role"
          value={personnel?.role || ""}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        >
          <option value="" disabled>
            Select Role
          </option>
          <option value="teacher">Teacher</option>
          <option value="bursar">Bursar</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="password"
          placeholder="Password (leave blank to keep)"
          name="password"
          value={personnel?.password || ""}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />

        <button
          type="submit"
          className="py-2 rounded font-semibold bg-white text-black hover:bg-gray-200 col-span-2"
        >
          Save Changes
        </button>

        {message && (
          <p
            className={`col-span-2 ${
              message.startsWith("✅") ? "text-green-400" : "text-red-500"
            } mt-2`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  );
};

export default PersonnelEditPage;
