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
const router = express.Router();

router.route("/bursar").get(verifyJWT, getAllBursars);
router.route("/teacher").get(verifyJWT, getAllTeachers);
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

module.exports = router;
