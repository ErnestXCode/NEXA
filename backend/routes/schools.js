// File: /routes/schoolExport.js
// Purpose: API routes for school admins to manage and export school data

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const verifyJWT = require("../middleware/verifyJWT");
const {
  getAllSchools,
  createSchool,
  getSchoolById,
  updateSchool,
  getMySchool,
  deleteSchool,
  getSubjectsForClass,
} = require("../controllers/school/allSchoolsController");

const { exportSchoolData, createExportFile } = require("../services/exportService");

/**
 * GET /api/school/export/:schoolId
 * Exports all data for the given school as a ZIP file
 */
router.get("/export/:schoolId", verifyJWT, async (req, res) => {
  try {
    const schoolId = req.params.schoolId;
    console.log("Export request for school:", schoolId, req.user.email);

    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }

    const data = await exportSchoolData(schoolId);

    // Ensure tmp folder exists
    const tmpDir = path.join(__dirname, "../../tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const filePath = path.join(tmpDir, `school_${schoolId}.zip`);
    await createExportFile(data, filePath);

    // Send the ZIP file to frontend
    res.download(filePath, "school_data.zip", (err) => {
      if (err) console.error("Download error:", err);
      // Delete temp file after sending
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error("Export failed:", err);
    res.status(500).send("Export failed");
  }
});

// -------------------- Other school routes --------------------

// Superadmin only
router.get("/", verifyJWT, getAllSchools);
router.post("/", verifyJWT, createSchool);
router.get("/me", verifyJWT, getMySchool);
router.get("/subjects/:classLevel", verifyJWT, getSubjectsForClass);
router.get("/:id", verifyJWT, getSchoolById);
router.put("/:id", verifyJWT, updateSchool);
router.delete("/:id", verifyJWT, deleteSchool);

module.exports = router;
