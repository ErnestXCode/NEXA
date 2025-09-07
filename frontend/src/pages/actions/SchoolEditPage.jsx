// src/pages/schools/SchoolEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SchoolEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch school
  const { data: schoolData, isLoading, isError } = useQuery({
    queryKey: ["school", id],
    queryFn: async () => (await api.get(`/schools/${id}`)).data,
  });

  const [school, setSchool] = useState(null);

  useEffect(() => {
    if (schoolData) setSchool(schoolData);
  }, [schoolData]);

  const updateMutation = useMutation({
    mutationFn: (updatedData) => api.put(`/schools/${id}`, updatedData),
    onSuccess: () => {
      queryClient.refetchQueries(["schools"]);
      queryClient.refetchQueries(["school", id]);
      navigate("/dashboard");
    },
  });

  if (isLoading) return <p className="text-white p-6">Loading school data...</p>;
  if (isError) return <p className="text-red-500 p-6">❌ Error fetching school</p>;
  if (!school) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSchool((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Subjects ---
  const handleSubjectsAdd = (subject) => {
    if (!subject || school.subjects.includes(subject)) return;
    setSchool((prev) => ({
      ...prev,
      subjects: [...prev.subjects, subject],
    }));
  };

  const handleSubjectsRemove = (subject) => {
    setSchool((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }));
  };

  // --- Class Levels & Streams ---
  const addClassLevel = () => {
    setSchool((prev) => ({
      ...prev,
      classLevels: [...prev.classLevels, { name: "", streams: [] }],
    }));
  };

  const removeClassLevel = (index) => {
    setSchool((prev) => ({
      ...prev,
      classLevels: prev.classLevels.filter((_, i) => i !== index),
    }));
  };

  const updateClassLevelName = (index, name) => {
    setSchool((prev) => {
      const updated = [...prev.classLevels];
      updated[index].name = name;
      return { ...prev, classLevels: updated };
    });
  };

  const addStream = (levelIndex, streamName) => {
    if (!streamName) return;
    setSchool((prev) => {
      const updated = [...prev.classLevels];
      if (!updated[levelIndex].streams.includes(streamName)) {
        updated[levelIndex].streams.push(streamName);
      }
      return { ...prev, classLevels: updated };
    });
  };

  const removeStream = (levelIndex, streamName) => {
    setSchool((prev) => {
      const updated = [...prev.classLevels];
      updated[levelIndex].streams = updated[levelIndex].streams.filter((s) => s !== streamName);
      return { ...prev, classLevels: updated };
    });
  };

  // --- Grading System ---
  const addGrade = () => {
    setSchool((prev) => ({
      ...prev,
      gradingSystem: [...prev.gradingSystem, { min: 0, max: 0, grade: "", remark: "" }],
    }));
  };

  const removeGrade = (index) => {
    setSchool((prev) => ({
      ...prev,
      gradingSystem: prev.gradingSystem.filter((_, i) => i !== index),
    }));
  };

  const updateGradeField = (index, field, value) => {
    setSchool((prev) => {
      const updated = [...prev.gradingSystem];
      updated[index][field] = field === "min" || field === "max" ? Number(value) : value;
      return { ...prev, gradingSystem: updated };
    });
  };

  // --- Fee Expectations ---
  const updateFee = (index, value) => {
    setSchool((prev) => {
      const updated = [...prev.feeExpectations];
      updated[index].amount = Number(value);
      return { ...prev, feeExpectations: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(school);
  };

  return (
    <main className="overflow-hidden flex items-start justify-center bg-gray-950 p-6">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-4xl space-y-6">
        <h1 className="text-xl font-semibold text-white">Edit School</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <input
              name="name"
              placeholder="School Name"
              value={school.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white text-sm"
            />
            <input
              name="address"
              placeholder="Address"
              value={school.address || ""}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white text-sm"
            />
            <input
              name="email"
              placeholder="Email"
              value={school.email || ""}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white text-sm"
            />
            <input
              name="phone"
              placeholder="Phone"
              value={school.phone || ""}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white text-sm"
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-gray-300 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {school.subjects.map((subj, idx) => (
                <span
                  key={idx}
                  className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {subj}
                  <button
                    type="button"
                    onClick={() => handleSubjectsRemove(subj)}
                    className="ml-1 text-xs text-red-200 hover:text-red-400"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                type="text"
                onKeyDown={(e) => {
                  if (["Enter", ",", " "].includes(e.key)) {
                    e.preventDefault();
                    handleSubjectsAdd(e.target.value.trim());
                    e.target.value = "";
                  }
                }}
                placeholder="Type subject and press Enter"
                className="flex-1 min-w-[120px] p-2 rounded bg-gray-700 text-white"
              />
            </div>
          </div>

          {/* Class Levels & Streams */}
          <div>
            <label className="block text-gray-300 mb-2">Class Levels & Streams</label>
            {school.classLevels.map((level, i) => (
              <div key={i} className="mb-3 border border-gray-800 p-2 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={level.name}
                    placeholder="Class Level Name"
                    onChange={(e) => updateClassLevelName(i, e.target.value)}
                    className="p-1 rounded bg-gray-800 text-white text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeClassLevel(i)}
                    className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {level.streams.map((stream, idx) => (
                    <span
                      key={idx}
                      className="bg-green-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      {stream}
                      <button
                        type="button"
                        onClick={() => removeStream(i, stream)}
                        className="ml-1 text-xs text-red-200 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add stream"
                    onKeyDown={(e) => {
                      if (["Enter", ",", " "].includes(e.key)) {
                        e.preventDefault();
                        addStream(i, e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                    className="p-1 rounded bg-gray-700 text-white text-xs min-w-[100px]"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addClassLevel}
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
            >
              + Add Class Level
            </button>
          </div>

          {/* Grading System */}
          <div>
            <label className="block text-gray-300 mb-2">Grading System</label>
            {school.gradingSystem.map((g, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={g.min}
                  onChange={(e) => updateGradeField(i, "min", e.target.value)}
                  className="p-1 rounded bg-gray-800 text-white text-xs w-16"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={g.max}
                  onChange={(e) => updateGradeField(i, "max", e.target.value)}
                  className="p-1 rounded bg-gray-800 text-white text-xs w-16"
                />
                <input
                  type="text"
                  placeholder="Grade"
                  value={g.grade}
                  onChange={(e) => updateGradeField(i, "grade", e.target.value)}
                  className="p-1 rounded bg-gray-800 text-white text-xs w-16"
                />
                <input
                  type="text"
                  placeholder="Remark"
                  value={g.remark}
                  onChange={(e) => updateGradeField(i, "remark", e.target.value)}
                  className="p-1 rounded bg-gray-800 text-white text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeGrade(i)}
                  className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addGrade}
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
            >
              + Add Grade
            </button>
          </div>

          {/* Fee Expectations */}
          <div>
            <label className="block text-gray-300 mb-2">Fee Expectations</label>
            {school.feeExpectations.map((f, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="w-20">{f.term}:</span>
                <input
                  type="number"
                  value={f.amount}
                  onChange={(e) => updateFee(i, e.target.value)}
                  className="p-1 rounded bg-gray-800 text-white text-xs flex-1"
                />
              </div>
            ))}
          </div>

          {/* Optional Modules */}
          <div>
            <label className="block text-gray-300 mb-2">Optional Modules</label>
            <div className="flex flex-wrap gap-4 mb-3">
              {["exams", "attendance", "feeTracking", "communication"].map((mod) => (
                <label key={mod} className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    name={mod}
                    checked={school.modules?.[mod] || false}
                    onChange={(e) =>
                      setSchool((prev) => ({
                        ...prev,
                        modules: { ...prev.modules, [mod]: e.target.checked },
                      }))
                    }
                  />
                  {mod.charAt(0).toUpperCase() + mod.slice(1)}
                </label>
              ))}
            </div>
          </div>

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

export default SchoolEditPage;
