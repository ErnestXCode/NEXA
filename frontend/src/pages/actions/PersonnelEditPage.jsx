import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomSelect from "../../components/layout/CustomSelect";

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

  // Fetch school data (subjects + classLevels)
  const { data: schoolData = {}, isLoading: schoolLoading } = useQuery({
    queryKey: ["schoolData"],
    queryFn: async () => {
      const res = await api.get("/schools/me");
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
      navigate(-1, { replace: true });
    },
  });

  if (isLoading || schoolLoading)
    return <p className="text-white p-6">Loading data...</p>;
  if (isError)
    return <p className="text-red-500 p-6">❌ Error fetching personnel</p>;
  if (!personnel) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updated = { ...personnel };

    if (type === "checkbox") updated[name] = checked;
    else updated[name] = value;

    // Handle role changes
    if (name === "role") {
      if (originalRole === "teacher" && value !== "teacher") {
        updated.subjects = [];
        updated.isClassTeacher = false;
        updated.classLevel = "";
      } else if (originalRole !== "teacher" && value === "teacher") {
        updated.subjects = updated.subjects || [];
        updated.isClassTeacher = updated.isClassTeacher || false;
        updated.classLevel = updated.classLevel || "";
      }
      setOriginalRole(value);
    }

    setPersonnel(updated);
  };

  const handleAddSubject = (subject) => {
    if (!personnel.subjects.includes(subject)) {
      setPersonnel((prev) => ({
        ...prev,
        subjects: [...prev.subjects, subject],
      }));
    }
  };

  const handleRemoveSubject = (subject) => {
    setPersonnel((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(personnel);
  };

  return (
    <main className="overflow-hidden mt-10 flex items-center justify-center bg-gray-950">
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

          {/* <select
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
          </select> */}

          <CustomSelect
            value={personnel.role}
            onChange={(val) =>
              handleChange({ target: { name: "role", value: val } })
            }
            placeholder="Select Role"
            options={[
              { value: "teacher", label: "Teacher" },
              { value: "bursar", label: "Bursar" },
            ]}
          />

          {/* Teacher-specific fields */}
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
                      onClick={() => handleRemoveSubject(subj)}
                      className="ml-1 text-xs text-red-200 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Dropdown for adding subjects */}
                {/* <select
                  onChange={(e) => {
                    if (!e.target.value) return;
                    handleAddSubject(e.target.value);
                    e.target.value = "";
                  }}
                  className="flex-1 min-w-[120px] p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">Select subject...</option>
                  {schoolData.subjects
                    .filter((s) => !personnel.subjects.includes(s))
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select> */}
                <CustomSelect
                  value="" // always reset after adding
                  onChange={(val) => handleAddSubject(val)}
                  placeholder="Select subject..."
                  options={schoolData.subjects
                    .filter((s) => !personnel.subjects.includes(s))
                    .map((s) => ({ value: s, label: s }))}
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
                <CustomSelect
                  value={personnel.classLevel || ""}
                  onChange={(val) =>
                    handleChange({ target: { name: "classLevel", value: val } })
                  }
                  placeholder="Select Class Level"
                  options={
                    schoolData.classLevels?.map((level) => ({
                      value: level.name,
                      label: level.name,
                    })) || []
                  }
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
