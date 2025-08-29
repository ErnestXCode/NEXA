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
const router = express.Router();

router.route("/bursar").get(getAllBursars);
router.route("/teacher").get(getAllTeachers);
router
  .route("/bursar/:id")
  .get(getBursarById)
  .put(updateBursar)
  .delete(deleteBursar);
router
  .route("/teacher/:id")
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

module.exports = router;
