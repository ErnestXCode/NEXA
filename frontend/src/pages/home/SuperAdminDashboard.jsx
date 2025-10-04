import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

const SuperAdminDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);

  const [modal, setModal] = useState({ open: false, title: "", message: "" });

  // Queries
  const schoolsQuery = useQuery({
    queryKey: ["schools"],
    queryFn: () => api.get("/schools").then((res) => res.data),
  });

  const paymentsQuery = useQuery({
    queryKey: ["manualPayments"],
    queryFn: () => api.get("/manual-payments").then((res) => res.data),
  });

  const schools = schoolsQuery.data?.slice(0, 3) || [];
  const schoolsLength = schoolsQuery.data?.length || 0;
  const payments = paymentsQuery.data || [];

  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const approvedPayments = payments.filter(p => p.status === "verified").length;
  const totalRevenue = payments.filter(p => p.status === "verified").reduce((sum, p) => sum + p.amount, 0);

  const placeholderSchoolDistribution = useMemo(() => {
    // Example: Group schools by region (placeholder)
    const regions = ["Nairobi", "Kisumu", "Mombasa"];
    return regions.map(r => ({ name: r, value: Math.floor(Math.random() * 10) + 1 }));
  }, [schoolsLength]);

  const placeholderPaymentsTrend = useMemo(() => {
    // Example: last 7 days payments (placeholder)
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return {
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 5), // placeholder
      };
    }).reverse();
  }, []);

  const COLORS = ["#22d3ee", "#4ade80", "#facc15", "#f43f5e", "#a855f7"];

  const handleVerify = async (id, status) => {
    try {
      const res = await api.post("/manual-payments/verify", { id, status });
      setModal({ open: true, title: "Payment Review", message: res.data.msg });
      paymentsQuery.refetch();
    } catch (err) {
      console.error("Verification error", err);
      setModal({ open: true, title: "Error", message: "Error verifying payment" });
    }
  };

  if (schoolsQuery.isLoading || paymentsQuery.isLoading) {
    return <p className="p-6 text-gray-400">Loading dashboard...</p>;
  }

  if (schoolsQuery.isError || paymentsQuery.isError) {
    return <p className="p-6 text-red-500">❌ Error loading dashboard data</p>;
  }

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen space-y-8">

      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Schools", value: schoolsLength },
          { label: "Pending Payments", value: pendingPayments },
          { label: "Approved Payments", value: approvedPayments },
          { label: "Total Revenue (KES)", value: totalRevenue },
        ].map((card, i) => (
          <div key={i} className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 flex flex-col justify-center items-center text-center hover:bg-gray-850 hover:scale-105 transition-transform duration-300">
            <p className="text-gray-400 text-sm uppercase mb-2">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="flex gap-4">
        <Link to="/dashboard/createSchool" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">+ Add School</Link>
        <Link to="/dashboard/manualPayments" className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">Review Payments</Link>
        <Link to="/dashboard/reports" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">Reports</Link>
      </div>

      {/* ===== Charts Section ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Distribution */}
        <div className="bg-gray-900 p-4 rounded-2xl shadow-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Schools by Region</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={placeholderSchoolDistribution} dataKey="value" nameKey="name" outerRadius={80} label>
                {placeholderSchoolDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payments Trend */}
        <div className="bg-gray-900 p-4 rounded-2xl shadow-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Payments Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={placeholderPaymentsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#bbb" />
              <YAxis allowDecimals={false} stroke="#bbb" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Manage Schools Table ===== */}
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

      {/* ===== Manual Payments Review ===== */}
      <section className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Manual Payment Proofs</h2>
        {payments.length > 0 ? (
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
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-850 transition">
                    <td className="py-2 px-4">{p.school?.name || "-"}</td>
                    <td className="py-2 px-4">{p.plan}</td>
                    <td className="py-2 px-4">KES {p.amount}</td>
                    <td className="py-2 px-4">{p.mpesaCode}</td>
                    <td className="py-2 px-4 capitalize">{p.status}</td>
                    <td className="py-2 px-4 space-x-2">
                      {p.status === "pending" ? (
                        <>
                          <button onClick={() => handleVerify(p._id, "verified")} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                          <button onClick={() => handleVerify(p._id, "rejected")} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                        </>
                      ) : (
                        <span className="text-gray-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No payment proofs submitted.</p>
        )}
      </section>

      {/* ===== Superadmin Notes / To-do ===== */}
      <section className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800">
        <h2 className="text-xl font-bold mb-2">Superadmin Notes</h2>
        <p className="text-gray-400 text-sm space-y-1">
          - Add feature to export payments to Excel<br/>
          - Implement school performance charts<br/>
          - Add teacher and student activity tracking<br/>
          - Generate monthly revenue reports<br/>
          - Implement system notifications
        </p>
      </section>

      {/* ✅ Modal */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">{modal.title}</h3>
            <p className="text-gray-300 mb-4">{modal.message}</p>
            <button onClick={() => setModal({ ...modal, open: false })} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SuperAdminDashboard;

// ===== Reusable Management Table =====
const ManagementTable = ({ title, data, columns, viewAllLink, addLink, addText, rowRender, minHeight }) => (
  <section className={`bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 ${minHeight}`}>
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <div className="flex justify-between items-center mb-4">
      <Link to={addLink} className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition">{addText}</Link>
      <Link to={viewAllLink} className="text-blue-400 hover:underline">View All</Link>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-800">
          <tr>{columns.map((col, i) => <th key={i} className="py-3 px-4 text-left border-b border-gray-700">{col}</th>)}</tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} className={`${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"} hover:bg-gray-850 transition`}>
                {rowRender(row).map((val, j) => <td key={j} className="py-2 px-4 border-b border-gray-800">{val}</td>)}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-gray-400">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);
