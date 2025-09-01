import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const Communication = () => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, isError } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await api.get("/communication");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const resendMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/communication/resend/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.refetchQueries(["messages"]),
  });

  if (isLoading)
    return (
      <main className="p-6 bg-gray-950 text-white min-h-screen">
        <p>Loading messages...</p>
      </main>
    );

  if (isError)
    return (
      <main className="p-6 bg-gray-950 text-white min-h-screen">
        <p className="text-red-500">❌ Failed to load messages</p>
      </main>
    );

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Communication Dashboard</h1>
      <table className="min-w-full text-left border border-gray-700">
        <thead>
          <tr>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Subject</th>
            <th className="border px-2 py-1">Recipients</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg._id} className="border-b border-gray-700">
              <td className="px-2 py-1">{new Date(msg.date).toLocaleString()}</td>
              <td className="px-2 py-1">{msg.subject}</td>
              <td className="px-2 py-1">
                {msg.recipients.map((r, i) => `${r.type}:${r.value}`).join(", ")}
              </td>
              <td className="px-2 py-1">{msg.type.toUpperCase()}</td>
              <td className="px-2 py-1">{msg.status}</td>
              <td className="px-2 py-1">
                {msg.status === "failed" && (
                  <button
                    onClick={() => resendMutation.mutate(msg._id)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded"
                  >
                    Resend
                  </button>
                )}
              </td>
            </tr>
          ))}
          {messages.length === 0 && (
            <tr>
              <td colSpan={6} className="px-2 py-2 text-gray-400">
                No messages found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
};

export default Communication;
