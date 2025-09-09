// File: /frontend/src/components/Admin/ExportSchoolData.jsx
// Purpose: Button component for admins to download school data

import React from "react";

export default function ExportSchoolData({ schoolId }) {
    const exportData = async () => {
        try {
            const res = await fetch(`/api/schools/export/${schoolId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error("Export failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "school_data.zip";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Failed to export school data.");
        }
    };

    return (
        <button
            onClick={exportData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Export School Data
        </button>
    );
}
