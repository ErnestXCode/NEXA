import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SchoolSettings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch logged-in school
  const { data: schoolData, isLoading, isError } = useQuery({
    queryKey: ["school", "me"],
    queryFn: async () => {
      const res = await api.get(`/schools/me`);
      return res.data;
    },
  });

  const [school, setSchool] = useState(null);

  useEffect(() => {
    if (schoolData) setSchool(schoolData);
  }, [schoolData]);

  const updateMutation = useMutation({
    mutationFn: (updatedData) => api.put(`/schools/${school._id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["school", "me"]);
      navigate("/dashboard");
    },
  });

  if (isLoading) return <p className="text-white p-6">Loading settings...</p>;
  if (isError) return <p className="text-red-500 p-6">❌ Error fetching school</p>;
  if (!school) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSchool((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(school);
  };

  // --- Fee Rule helpers (already in your file) ---
  const addFeeRule = () => {
    const fromDefault = school.classLevels?.[0]?.name || "";
    const toDefault = school.classLevels?.[school.classLevels.length - 1]?.name || fromDefault || "";
    setSchool((prev) => ({
      ...prev,
      feeRules: [
        ...(prev.feeRules || []),
        { fromClass: fromDefault, toClass: toDefault, term: "Term 1", amount: 0 },
      ],
    }));
  };

  const updateFeeRule = (idx, key, value) => {
    const newRules = [...(school.feeRules || [])];
    newRules[idx] = { ...newRules[idx], [key]: value };
    setSchool((prev) => ({ ...prev, feeRules: newRules }));
  };

  const removeFeeRule = (idx) => {
    const newRules = (school.feeRules || []).filter((_, i) => i !== idx);
    setSchool((prev) => ({ ...prev, feeRules: newRules }));
  };

  // --- Subjects by Class Range helpers (NEW) ---
  const addSubjectsRule = () => {
    const fromDefault = school.classLevels?.[0]?.name || "";
    const toDefault = school.classLevels?.[school.classLevels.length - 1]?.name || fromDefault || "";
    setSchool((prev) => ({
      ...prev,
      subjectsByClass: [
        ...(prev.subjectsByClass || []),
        { fromClass: fromDefault, toClass: toDefault, subjects: [] },
      ],
    }));
  };

  const updateSubjectsRule = (idx, key, value) => {
    const newRules = [...(school.subjectsByClass || [])];
    newRules[idx] = { ...newRules[idx], [key]: value };
    setSchool((prev) => ({ ...prev, subjectsByClass: newRules }));
  };

  const handleExport = async () => {
  try {
    const res = await api.get(`/schools/export/${school._id}`, {
      responseType: "blob", // important for downloading files
    });

    const blob = new Blob([res.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school_${school.name}_data.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to export school data.");
  }
};


  const addSubjectToRule = (idx, subject) => {
    if (!subject) return;
    const newRules = [...(school.subjectsByClass || [])];
    const rule = newRules[idx] || { subjects: [] };
    rule.subjects = Array.from(new Set([...(rule.subjects || []), subject]));
    newRules[idx] = rule;
    setSchool((prev) => ({ ...prev, subjectsByClass: newRules }));
  };

  const removeSubjectFromRule = (idx, subject) => {
    const newRules = [...(school.subjectsByClass || [])];
    newRules[idx].subjects = (newRules[idx].subjects || []).filter((s) => s !== subject);
    setSchool((prev) => ({ ...prev, subjectsByClass: newRules }));
  };

  const removeSubjectsRule = (idx) => {
    const newRules = (school.subjectsByClass || []).filter((_, i) => i !== idx);
    setSchool((prev) => ({ ...prev, subjectsByClass: newRules }));
  };

  return (
    <main className="min-h-screen flex items-start justify-center bg-gray-950 p-6">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-5xl">
        <h1 className="text-xl font-semibold text-white mb-6">🏫 School Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <section>
            <h2 className="text-gray-200 font-semibold mb-3 border-b border-gray-700 pb-1">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </section>

          {/* Subjects (global) */}
          <section>
            <h2 className="text-gray-200 font-semibold mb-3 border-b border-gray-700 pb-1">
              Subjects (Global)
            </h2>
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
          </section>

          {/* Class Levels */}
          <section>
            <h2 className="text-gray-200 font-semibold mb-3 border-b border-gray-700 pb-1">
              Class Levels & Streams
            </h2>
            <div className="space-y-3">
              {school.classLevels.map((cls, idx) => (
                <div key={idx} className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <input
                      value={cls.name}
                      onChange={(e) => {
                        const newLevels = [...school.classLevels];
                        newLevels[idx].name = e.target.value;
                        setSchool((prev) => ({ ...prev, classLevels: newLevels }));
                      }}
                      className="flex-1 mr-2 p-2 rounded bg-gray-700 text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLevels = school.classLevels.filter((_, i) => i !== idx);
                        setSchool((prev) => ({ ...prev, classLevels: newLevels }));
                      }}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cls.streams.map((s, i) => (
                      <span
                        key={i}
                        className="bg-green-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => {
                            const newLevels = [...school.classLevels];
                            newLevels[idx].streams = newLevels[idx].streams.filter(
                              (_, si) => si !== i
                            );
                            setSchool((prev) => ({ ...prev, classLevels: newLevels }));
                          }}
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
                        if (["Enter", ","].includes(e.key)) {
                          e.preventDefault();
                          const newLevels = [...school.classLevels];
                          newLevels[idx].streams.push(e.target.value.trim());
                          setSchool((prev) => ({ ...prev, classLevels: newLevels }));
                          e.target.value = "";
                        }
                      }}
                      className="flex-1 min-w-[120px] p-2 rounded bg-gray-700 text-white text-sm"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setSchool((prev) => ({
                    ...prev,
                    classLevels: [...prev.classLevels, { name: "New Class", streams: [] }],
                  }))
                }
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                ➕ Add Level
              </button>
            </div>
          </section>

          {/* Grading System */}
          <section>
            <h2 className="text-gray-200 font-semibold mb-3 border-b border-gray-700 pb-1">
              Grading System
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300 border border-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 border-b border-gray-700">Min</th>
                    <th className="px-3 py-2 border-b border-gray-700">Max</th>
                    <th className="px-3 py-2 border-b border-gray-700">Grade</th>
                    <th className="px-3 py-2 border-b border-gray-700">Remark</th>
                    <th className="px-3 py-2 border-b border-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {school.gradingSystem.map((g, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/50">
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={g.min}
                          onChange={(e) => {
                            const newGrades = [...school.gradingSystem];
                            newGrades[idx].min = Number(e.target.value);
                            setSchool((prev) => ({ ...prev, gradingSystem: newGrades }));
                          }}
                          className="w-20 p-1 rounded bg-gray-800 text-white text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={g.max}
                          onChange={(e) => {
                            const newGrades = [...school.gradingSystem];
                            newGrades[idx].max = Number(e.target.value);
                            setSchool((prev) => ({ ...prev, gradingSystem: newGrades }));
                          }}
                          className="w-20 p-1 rounded bg-gray-800 text-white text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={g.grade}
                          onChange={(e) => {
                            const newGrades = [...school.gradingSystem];
                            newGrades[idx].grade = e.target.value;
                            setSchool((prev) => ({ ...prev, gradingSystem: newGrades }));
                          }}
                          className="w-20 p-1 rounded bg-gray-800 text-white text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={g.remark || ""}
                          onChange={(e) => {
                            const newGrades = [...school.gradingSystem];
                            newGrades[idx].remark = e.target.value;
                            setSchool((prev) => ({ ...prev, gradingSystem: newGrades }));
                          }}
                          className="w-28 p-1 rounded bg-gray-800 text-white text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newGrades = school.gradingSystem.filter((_, i) => i !== idx);
                            setSchool((prev) => ({ ...prev, gradingSystem: newGrades }));
                          }}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          ✕ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() =>
                  setSchool((prev) => ({
                    ...prev,
                    gradingSystem: [
                      ...prev.gradingSystem,
                      { min: 0, max: 0, grade: "New", remark: "" },
                    ],
                  }))
                }
                className="mt-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                ➕ Add Grade Row
              </button>
            </div>
          </section>

          {/* Fee Expectations */}
          <section>
            <h2 className="text-gray-200 font-semibold mb-3 border-b border-gray-700 pb-1">
              Fee Expectations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {school.feeExpectations.map((fee, idx) => (
                <div key={idx} className="bg-gray-800 p-3 rounded">
                  <label className="block text-gray-400 text-xs mb-1">{fee.term}</label>
                  <input
                    type="number"
                    value={fee.amount}
                    onChange={(e) => {
                      const newFees = [...school.feeExpectations];
                      newFees[idx].amount = Number(e.target.value);
                      setSchool((prev) => ({ ...prev, feeExpectations: newFees }));
                    }}
                    className="w-full p-2 rounded bg-gray-700 text-white text-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Fee Rules (by class range) */}
          <section>
            <h2 className="text-gray-200 font-semibold mb-3 border-b border-gray-700 pb-1">
              Fee Rules (by Class Range)
            </h2>
            <div className="space-y-3">
              {school.feeRules?.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 p-3 rounded border border-gray-700 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                >
                  <select
                    value={rule.fromClass}
                    onChange={(e) => updateFeeRule(idx, "fromClass", e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white text-sm"
                  >
                    {school.classLevels && school.classLevels.length ? (
                      school.classLevels.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value={rule.fromClass || ""}>No classes</option>
                    )}
                  </select>

                  <select
                    value={rule.toClass}
                    onChange={(e) => updateFeeRule(idx, "toClass", e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white text-sm"
                  >
                    {school.classLevels && school.classLevels.length ? (
                      school.classLevels.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value={rule.toClass || ""}>No classes</option>
                    )}
                  </select>

                  <select
                    value={rule.term}
                    onChange={(e) => updateFeeRule(idx, "term", e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white text-sm"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>

                  <input
                    type="number"
                    value={rule.amount}
                    onChange={(e) => updateFeeRule(idx, "amount", Number(e.target.value))}
                    placeholder="Fee Amount"
                    className="p-2 rounded bg-gray-700 text-white text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => removeFeeRule(idx)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addFeeRule}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                ➕ Add Fee Rule
              </button>
            </div>
          </section>

          {/* Subjects By Class Range (NEW) */}
          <section>
            <h2 className="text-gray-200 font-semibold mb-3 border-b border-gray-700 pb-1">
              Subjects by Class Range
            </h2>
            <div className="space-y-3">
              {school.subjectsByClass?.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 p-3 rounded border border-gray-700"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2 items-center">
                    <select
                      value={rule.fromClass}
                      onChange={(e) => updateSubjectsRule(idx, "fromClass", e.target.value)}
                      className="p-2 rounded bg-gray-700 text-white text-sm"
                    >
                      {school.classLevels && school.classLevels.length ? (
                        school.classLevels.map((c, i) => (
                          <option key={i} value={c.name}>
                            {c.name}
                          </option>
                        ))
                      ) : (
                        <option value={rule.fromClass || ""}>No classes</option>
                      )}
                    </select>

                    <select
                      value={rule.toClass}
                      onChange={(e) => updateSubjectsRule(idx, "toClass", e.target.value)}
                      className="p-2 rounded bg-gray-700 text-white text-sm"
                    >
                      {school.classLevels && school.classLevels.length ? (
                        school.classLevels.map((c, i) => (
                          <option key={i} value={c.name}>
                            {c.name}
                          </option>
                        ))
                      ) : (
                        <option value={rule.toClass || ""}>No classes</option>
                      )}
                    </select>

                    <input
                      type="text"
                      placeholder="Add subject and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val) {
                            addSubjectToRule(idx, val);
                            e.target.value = "";
                          }
                        }
                      }}
                      className="p-2 rounded bg-gray-700 text-white text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => removeSubjectsRule(idx)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕ Remove Rule
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(rule.subjects || []).map((s, si) => (
                      <span key={si} className="bg-indigo-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-2">
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSubjectFromRule(idx, s)}
                          className="ml-1 text-xs text-red-200 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {(rule.subjects || []).length === 0 && (
                      <div className="text-gray-400 text-sm">No subjects set for this range</div>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSubjectsRule}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                ➕ Add Subjects Rule
              </button>
            </div>
          </section>

          {/* Optional Modules */}
          <section>
            <h2 className="text-gray-200 font-semibold mb-3 border-b border-gray-700 pb-1">
              Optional Modules
            </h2>
            <div className="flex flex-wrap gap-4">
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
          </section>

          <button
    type="button"
    onClick={handleExport}
    className="w-full py-2 mb-3 rounded bg-green-600 text-white font-medium text-sm hover:bg-green-500"
  >
    ⬇️ Export School Data
  </button>

  {/* Save Settings Button */}
  <button
    type="submit"
    className="w-full py-2 rounded bg-blue-600 text-white font-medium text-sm hover:bg-blue-500"
  >
    💾 Save Settings
  </button>
        </form>
      </div>
    </main>
  );
};

export default SchoolSettings;
