// src/pages/students/AllStudents.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

const deleteStudent = async (id) => {
  await api.delete(`/students/${id}`);
};

const AllStudents = () => {
  const [showModal, setShowModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch students
  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["students"] });
      const previousStudents = queryClient.getQueryData(["students"]);
      queryClient.setQueryData(["students"], (old = []) =>
        old.filter((b) => b._id !== id)
      );
      return { previousStudents };
    },
    onError: (err, id, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(["students"], context.previousStudents);
      }
    },
    onSuccess: () => {
      setShowModal(false);
      setStudentToDelete(null);
    },
    onSettled: () => {
      queryClient.refetchQueries(["students"]);
    },
  });

  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete._id);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setStudentToDelete(null);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/students/edit/${id}`);
  };

  // Filter students based on name and class
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesName = `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesClass = classFilter
        ? s.classLevel.toLowerCase().includes(classFilter.toLowerCase())
        : true;
      return matchesName && matchesClass;
    });
  }, [students, searchTerm, classFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) return <main className="p-6 bg-gray-950 min-h-screen text-white">Loading students...</main>;
  if (isError) return <main className="p-6 bg-gray-950 min-h-screen text-white">❌ Failed to load students.</main>;

  return (
    <main className="p-6 bg-gray-950 min-h-screen relative">
      <h1 className="text-2xl font-bold mb-4 text-white">All Students</h1>

      {/* Search inputs */}
      <div className="mb-4 flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Search by class..."
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead className="bg-gray-800">
          <tr>
       
            <th className="p-2 text-left text-white">Name</th>
            <th className="p-2 text-left text-white">Gender</th>
            <th className="p-2 text-left text-white">DOB</th>
            <th className="p-2 text-left text-white">Class</th>
            <th className="p-2 text-left text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s, i) => {
              if( s.firstName === 'Susan'  && s.lastName === 'Jackson') console.log(s.guardian)
              return <tr
                key={s._id || i}
                className={`${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"} hover:bg-gray-850 transition`}
              >
               
                <td className="p-2 text-white">{s.firstName} {s.middleName} {s.lastName}</td>
                <td className="p-2 text-white">{s.gender}</td>
                <td className="p-2 text-white">{formatDate(s.dateOfBirth)}</td>
                <td className="p-2 text-white">{s.classLevel}</td>
        
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(s._id)} className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition">
                    Edit
                  </button>
                  <button onClick={() => confirmDelete(s)} className="px-3 py-1 rounded border border-gray-700 text-gray-200 hover:bg-gray-800 transition">
                    Delete
                  </button>
                </td>
              </tr>
})
          ) : (
            <tr>
              <td colSpan="8" className="text-center p-4 text-gray-400">No students found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold text-white mb-4">Delete Student</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold">{studentToDelete.firstName} {studentToDelete.lastName}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancel} className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleteMutation.isLoading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition">
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AllStudents;
