const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const {
  getAllSchools,
  createSchool,
  getSchoolById,
  updateSchool,
  deleteSchool,
} = require("../controllers/school/allSchoolsController");

// Superadmin only
router.get("/", verifyJWT, authorize(["superadmin"]), getAllSchools);
router.post("/", verifyJWT, authorize(["superadmin"]), createSchool);
router.get("/:id", verifyJWT, authorize(["superadmin"]), getSchoolById);
router.put("/:id", verifyJWT, authorize(["superadmin"]), updateSchool);
router.delete("/:id", verifyJWT, authorize(["superadmin"]), deleteSchool);

module.exports = router;
