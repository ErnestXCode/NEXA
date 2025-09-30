// src/pages/SuperAdmindashboard/SuperAdminDashboard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const SuperAdminDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);

  // Local state for modal
  const [modal, setModal] = useState({ open: false, title: "", message: "" });

  // Queries
  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => api.get("/personel/teacher").then((res) => res.data),
  });

  const paymentsQuery = useQuery({
    queryKey: ["manualPayments"],
    queryFn: () => api.get("/manual-payments").then((res) => res.data),
  });

  // Approve / Reject actions
  const handleVerify = async (id, status) => {
    try {
      const res = await api.post("/manual-payments/verify", { id, status });
      setModal({
        open: true,
        title: "Payment Review",
        message: res.data.msg,
      });
      paymentsQuery.refetch();
    } catch (err) {
      console.error("Verification error", err);
      setModal({
        open: true,
        title: "Error",
        message: "Error verifying payment",
      });
    }
  };

  const bursarsQuery = useQuery({
    queryKey: ["bursars"],
    queryFn: () => api.get("/personel/bursar").then((res) => res.data),
  });

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get("/students").then((res) => res.data),
  });

  const parentsQuery = useQuery({
    queryKey: ["parents"],
    queryFn: () => api.get("/personel/parent").then((res) => res.data),
  });

  const schoolsQuery = useQuery({
    queryKey: ["schools"],
    queryFn: () => api.get("/schools").then((res) => res.data),
  });

  // Derived values
  const teachers = teachersQuery.data?.slice(0, 3) || [];
  const bursars = bursarsQuery.data?.slice(0, 3) || [];
  const students = studentsQuery.data?.slice(0, 3) || [];
  const parents = parentsQuery.data?.slice(0, 3) || [];
  const schools = schoolsQuery.data?.slice(0, 3) || [];

  const teachersLength = teachersQuery.data?.length || 0;
  const bursarsLength = bursarsQuery.data?.length || 0;
  const studentsLength = studentsQuery.data?.length || 0;
  const parentsLength = parentsQuery.data?.length || 0;
  const schoolsLength = schoolsQuery.data?.length || 0;

  if (
    teachersQuery.isLoading ||
    bursarsQuery.isLoading ||
    studentsQuery.isLoading ||
    parentsQuery.isLoading ||
    schoolsQuery.isLoading
  ) {
    return <p className="p-6 text-gray-400">Loading dashboard...</p>;
  }

  if (
    teachersQuery.isError ||
    bursarsQuery.isError ||
    studentsQuery.isError ||
    parentsQuery.isError ||
    schoolsQuery.isError
  ) {
    return <p className="p-6 text-red-500">❌ Error loading dashboard data</p>;
  }

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen space-y-8">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {[
          { label: "Students", value: studentsLength },
          { label: "Teachers", value: teachersLength },
          { label: "Bursars", value: bursarsLength },
          { label: "Parents", value: parentsLength },
          { label: "Schools", value: schoolsLength },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 flex flex-col justify-center items-center text-center hover:bg-gray-850 transition"
          >
            <p className="text-gray-400 text-sm uppercase mb-2">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Management Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-2">
          <ManagementTable
            title="Manage Schools"
            data={schools}
            columns={["Name", "Email", "Phone", "Location"]}
            viewAllLink="/dashboard/schools"
            addLink="/dashboard/createSchool"
            addText="+ Add School"
            minHeight="min-h-[300px]"
            rowRender={(school) => [
              school.name,
              school.email || "-",
              school.phone || "-",
              school.location || "-",
            ]}
          />
        </div>
      </div>

      {/* Manual Payments Review */}
      <section className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Manual Payment Proofs</h2>
        {paymentsQuery.isLoading ? (
          <p className="text-gray-400">Loading payments...</p>
        ) : paymentsQuery.isError ? (
          <p className="text-red-500">Error loading payments</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-800">
                <tr>
                  <th className="py-3 px-4 text-left">School</th>
                  <th className="py-3 px-4 text-left">Plan</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">M-Pesa Code</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentsQuery.data.length > 0 ? (
                  paymentsQuery.data.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-850 transition">
                      <td className="py-2 px-4">{p.school?.name || "-"}</td>
                      <td className="py-2 px-4">{p.plan}</td>
                      <td className="py-2 px-4">KES {p.amount}</td>
                      <td className="py-2 px-4">{p.mpesaCode}</td>
                      <td className="py-2 px-4 capitalize">{p.status}</td>
                      <td className="py-2 px-4 space-x-2">
                        {p.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleVerify(p._id, "verified")}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerify(p._id, "rejected")}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      No payment proofs submitted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ✅ Modal */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">{modal.title}</h3>
            <p className="text-gray-300 mb-4">{modal.message}</p>
            <button
              onClick={() => setModal({ ...modal, open: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SuperAdminDashboard;

// Reusable Management Table
const ManagementTable = ({
  title,
  data,
  columns,
  viewAllLink,
  addLink,
  addText,
  rowRender,
  minHeight,
}) => (
  <section
    className={`bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 ${minHeight}`}
  >
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <div className="flex justify-between items-center mb-4">
      <Link
        to={addLink}
        className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        {addText}
      </Link>
      <Link to={viewAllLink} className="text-blue-400 hover:underline">
        View All
      </Link>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-800">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="py-3 px-4 text-left border-b border-gray-700"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                } hover:bg-gray-850 transition`}
              >
                {rowRender(row).map((val, j) => (
                  <td key={j} className="py-2 px-4 border-b border-gray-800">
                    {val}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-gray-400"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);
