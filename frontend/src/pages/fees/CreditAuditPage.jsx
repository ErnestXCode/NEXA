import React, { useState } from "react";
import api from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const CreditAuditPage = () => {
  const [filters, setFilters] = useState({
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    term: "",
    classLevel: "",
  });

  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, isPreviousData, refetch } = useQuery({
    queryKey: ["studentCredits", filters, page],
    queryFn: async () => {
      const params = { ...filters, page, limit };
      const res = await api.get("/credits/all", { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const credits = data?.credits || [];
  const totalPages = data?.totalPages || 1;

  const terms = ["Term 1", "Term 2", "Term 3"];

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6">💳 Student Credit Audit</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Academic Year"
          value={filters.academicYear}
          onChange={(e) =>
            setFilters({ ...filters, academicYear: e.target.value })
          }
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />

        <select
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">All Terms</option>
          {terms.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Class Level"
          value={filters.classLevel}
          onChange={(e) =>
            setFilters({ ...filters, classLevel: e.target.value })
          }
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />

        <button
          onClick={() => {
            setPage(1);
            refetch();
          }}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p>Loading credits...</p>
      ) : credits.length === 0 ? (
        <p>No credits found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-800 rounded text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2">Student</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Term</th>
                  <th className="p-2">Academic Year</th>
                  <th className="p-2">Source</th>
                  <th className="p-2">Applied To</th>
                  <th className="p-2">Note</th>
                  <th className="p-2">Created By</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((c) => (
                  <tr key={c._id} className="border-t border-gray-800">
                    <td className="p-2">
                      {c.student?.firstName} {c.student?.lastName}
                    </td>
                    <td className="p-2">{c.student?.classLevel}</td>
                    <td className="p-2">KSh {c.amount}</td>
                    <td className="p-2">{c.term}</td>
                    <td className="p-2">{c.academicYear}</td>
                    <td className="p-2">{c.source}</td>
                    <td className="p-2">{c.appliedTo || "-"}</td>
                    <td className="p-2">{c.note || "-"}</td>
                    <td className="p-2">{c.createdBy?.name || "N/A"}</td>
                    <td className="p-2">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isFetching && !isPreviousData && (
            <p className="text-gray-400 text-center mt-2 text-sm">
              Updating credits...
            </p>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            disabled={page === 1 || isFetching}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CreditAuditPage;
