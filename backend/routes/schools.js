const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const {
  getAllSchools,
  createSchool,
  getSchoolById,
  updateSchool,
  getMySchool,
  deleteSchool,
  getSubjectsForClass,
} = require("../controllers/school/allSchoolsController");

// Superadmin only
router.get("/", verifyJWT,getAllSchools);
router.post("/", verifyJWT,createSchool);
router.get("/me", verifyJWT,getMySchool);
router.get("/subjects/:classLevel", verifyJWT, getSubjectsForClass);
router.get("/:id", verifyJWT,getSchoolById);
router.put("/:id", verifyJWT,updateSchool);
router.delete("/:id", verifyJWT,deleteSchool);

module.exports = router;
