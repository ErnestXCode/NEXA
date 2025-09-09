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
const {
  getAllParents,
  getParentById,
  updateParent,
  deleteParent,
  getParentDashboard,
  getChildrenExams,
  getStudentAttendanceSummary,
} = require("../controllers/personel/parents/parentController");
const router = express.Router();

router.route("/bursar").get(verifyJWT, getAllBursars);
router.route("/teacher").get(verifyJWT, getAllTeachers);
router.route("/parent").get(verifyJWT, getAllParents);

router.route("/parent/dashboard").get(verifyJWT, getParentDashboard);
router.route("/parent/attendance-summary").get(verifyJWT, getStudentAttendanceSummary);
router.route("/parent/children-exams").get(verifyJWT, getChildrenExams);

router
  .route("/parent/:id")
  .get(verifyJWT, getParentById)
  .put(verifyJWT, updateParent)
  .delete(verifyJWT, deleteParent);
router
  .route("/bursar/:id")
  .get(verifyJWT, getBursarById)
  .put(verifyJWT, updateBursar)
  .delete(verifyJWT, deleteBursar);
router
  .route("/teacher/:id")
  .get(verifyJWT, getTeacherById)
  .put(verifyJWT, updateTeacher)
  .delete(verifyJWT, deleteTeacher);

router.route("/id/:id").get(verifyJWT, getPersonnelById);
router.route("/edit/:id").put(verifyJWT, updatePersonnel);

module.exports = router;
