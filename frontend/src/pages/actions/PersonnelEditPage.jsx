import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PersonnelEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch personnel
  const {
    data: personnelData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["personnel", id],
    queryFn: async () => {
      const res = await api.get(`/personel/id/${id}`);
      return res.data;
    },
  });

  const [personnel, setPersonnel] = useState(null);
  const [originalRole, setOriginalRole] = useState("");

  useEffect(() => {
    if (personnelData) {
      setPersonnel(personnelData);
      setOriginalRole(personnelData.role);
    }
  }, [personnelData]);

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
  if (!personnel) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let updated = { ...personnel };

    // Handle checkbox
    if (type === "checkbox") updated[name] = checked;
    else updated[name] = value;

    // Handle role changes
    if (name === "role") {
      if (originalRole === "teacher" && value !== "teacher") {
        // Switching from teacher → bursar/admin → clear teacher-specific fields
        updated.subjects = [];
        updated.isClassTeacher = false;
        updated.classLevel = null;
      } else if (originalRole !== "teacher" && value === "teacher") {
        // Switching from non-teacher → teacher → set defaults if needed
        updated.subjects = updated.subjects || [];
        updated.isClassTeacher = updated.isClassTeacher || false;
        updated.classLevel = updated.classLevel || "";
      }
      setOriginalRole(value);
    }

    setPersonnel(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(personnel);
  };

  return (
    <main className="overflow-hidden flex items-center justify-center bg-gray-950">
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
          <input
            placeholder="Phone Number"
            name="phoneNumber"
            value={personnel.phoneNumber}
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
          </select>

          {/* --- Teacher-specific fields --- */}
          {/* --- Teacher-specific fields --- */}
          {personnel.role === "teacher" && (
            <>
              {/* Subjects */}
              <label className="block text-gray-300 mb-2">Subjects</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {personnel.subjects.map((subj, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {subj}
                    <button
                      type="button"
                      onClick={() =>
                        setPersonnel((prev) => ({
                          ...prev,
                          subjects: prev.subjects.filter((s) => s !== subj),
                        }))
                      }
                      className="ml-1 text-xs text-red-200 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "," || e.key === " ") {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value && !personnel.subjects.includes(value)) {
                        setPersonnel((prev) => ({
                          ...prev,
                          subjects: [...prev.subjects, value],
                        }));
                      }
                      e.target.value = "";
                    }
                  }}
                  placeholder="Type subject and press Enter"
                  className="flex-1 min-w-[120px] p-2 rounded bg-gray-700 text-white"
                />
              </div>

              {/* Class Teacher */}
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  name="isClassTeacher"
                  checked={personnel.isClassTeacher}
                  onChange={handleChange}
                />
                Is Class Teacher?
              </label>

              {personnel.isClassTeacher && (
                <input
                  type="text"
                  name="classLevel"
                  value={personnel.classLevel || ""}
                  onChange={handleChange}
                  placeholder="Class Level e.g., Grade 5"
                  className="w-full p-2 rounded bg-gray-800 text-white text-sm"
                />
              )}
            </>
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

export default PersonnelEditPage;
