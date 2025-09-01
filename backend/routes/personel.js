const express = require("express");
const {
  getAllBursars,
  getBursarById,
  updateBursar,
  deleteBursar,
} = require("../controllers/personel/bursar/bursarController");
const {
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/personel/teacher/teacherController");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const {
  getPersonnelById,
  updatePersonnel,
} = require("../controllers/personel/personnelController");
const { getAllParents, getParentById, updateParent, deleteParent } = require("../controllers/personel/parents/parentController");
const router = express.Router();

router
  .route("/bursar")
  .get(verifyJWT, authorize(["superadmin", "admin"]), getAllBursars);
router
  .route("/teacher")
  .get(verifyJWT, authorize(["superadmin", "admin"]), getAllTeachers);
router
  .route("/parent")
  .get(verifyJWT, authorize(["superadmin", "admin"]), getAllParents);
router
  .route("/parent/:id")
  .get(verifyJWT, authorize(["superadmin", "admin"]), getParentById)
  .put(verifyJWT, authorize(["superadmin", "admin"]), updateParent)
  .delete(verifyJWT, authorize(["superadmin", "admin"]), deleteParent);
router
  .route("/bursar/:id")
  .get(verifyJWT, authorize(["superadmin", "admin"]), getBursarById)
  .put(verifyJWT, authorize(["superadmin", "admin"]), updateBursar)
  .delete(verifyJWT, authorize(["superadmin", "admin"]), deleteBursar);
router
  .route("/teacher/:id")
  .get(verifyJWT, authorize(["superadmin", "admin"]), getTeacherById)
  .put(verifyJWT, authorize(["superadmin", "admin"]), updateTeacher)
  .delete(verifyJWT, authorize(["superadmin", "admin"]), deleteTeacher);

router.route("/id/:id").get(verifyJWT, getPersonnelById);
router.route("/edit/:id").put(verifyJWT, updatePersonnel);

module.exports = router;
