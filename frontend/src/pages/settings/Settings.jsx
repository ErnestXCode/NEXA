import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchSettings = async () => {
  const res = await api.get("/settings");
  return res.data;
};

const updateSettings = async (data) => {
  const res = await api.put("/settings", data);
  return res.data;
};

const Settings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
    },
  });

  const [form, setForm] = useState({
    classLevels: [],
    streams: [],
    gradingSystem: [],
  });

  React.useEffect(() => {
    if (settings) {
      setForm({
        classLevels: settings.classLevels || [],
        streams: settings.streams || [],
        gradingSystem: settings.gradingSystem || [],
      });
    }
  }, [settings]);

  const handleClassLevelChange = (index, field, value) => {
    const newLevels = [...form.classLevels];
    newLevels[index][field] = value;
    setForm({ ...form, classLevels: newLevels });
  };

  const addClassLevel = () => {
    setForm({ ...form, classLevels: [...form.classLevels, { name: "", subjects: [] }] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return <p className="text-white">Loading settings...</p>;
  if (isError) return <p className="text-red-500">Failed to load settings.</p>;

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">School Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class Levels */}
        <section className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Class Levels</h2>
          {form.classLevels.map((level, i) => (
            <div key={i} className="mb-4">
              <input
                type="text"
                value={level.name}
                onChange={(e) => handleClassLevelChange(i, "name", e.target.value)}
                placeholder="Class Name"
                className="p-2 rounded bg-gray-800 text-white mb-2"
              />
              <input
                type="text"
                value={level.subjects.join(", ")}
                onChange={(e) =>
                  handleClassLevelChange(i, "subjects", e.target.value.split(","))
                }
                placeholder="Subjects (comma separated)"
                className="p-2 rounded bg-gray-800 text-white w-full"
              />
            </div>
          ))}
          <button type="button" onClick={addClassLevel} className="bg-blue-600 px-3 py-1 rounded">
            + Add Class Level
          </button>
        </section>

        {/* Streams */}
        <section className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Streams</h2>
          <input
            type="text"
            value={form.streams.join(", ")}
            onChange={(e) => setForm({ ...form, streams: e.target.value.split(",") })}
            placeholder="Streams (comma separated)"
            className="p-2 rounded bg-gray-800 text-white w-full"
          />
        </section>

        {/* Grading System */}
        <section className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Grading System</h2>
          {form.gradingSystem.map((g, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={g.grade}
                onChange={(e) => {
                  const newGrades = [...form.gradingSystem];
                  newGrades[i].grade = e.target.value;
                  setForm({ ...form, gradingSystem: newGrades });
                }}
                placeholder="Grade"
                className="p-2 rounded bg-gray-800 text-white w-20"
              />
              <input
                type="number"
                value={g.min}
                onChange={(e) => {
                  const newGrades = [...form.gradingSystem];
                  newGrades[i].min = e.target.value;
                  setForm({ ...form, gradingSystem: newGrades });
                }}
                placeholder="Min"
                className="p-2 rounded bg-gray-800 text-white w-24"
              />
              <input
                type="number"
                value={g.max}
                onChange={(e) => {
                  const newGrades = [...form.gradingSystem];
                  newGrades[i].max = e.target.value;
                  setForm({ ...form, gradingSystem: newGrades });
                }}
                placeholder="Max"
                className="p-2 rounded bg-gray-800 text-white w-24"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                gradingSystem: [...form.gradingSystem, { grade: "", min: 0, max: 0 }],
              })
            }
            className="bg-blue-600 px-3 py-1 rounded"
          >
            + Add Grade
          </button>
        </section>

        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold"
        >
          {mutation.isLoading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </main>
  );
};

export default Settings;
