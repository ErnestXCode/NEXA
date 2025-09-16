const express = require("express");
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsWithSubjects,
  promoteStudentsNextYear,
} = require("../controllers/students/studentController");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const bulkCreateStudents = require("../controllers/students/bulkStudentController");
const router = express.Router();



router.route("/").get(verifyJWT, getAllStudents).post(verifyJWT , createStudent);
router.route("/bulk").get(verifyJWT, getAllStudents).post(verifyJWT , bulkCreateStudents);

router.route("/promote").post(promoteStudentsNextYear);

router.route("/students-with-subjects").get(verifyJWT, getStudentsWithSubjects)



router
  .route("/:id")
  .get(verifyJWT, getStudentById)
  .put(verifyJWT, updateStudent)
  .delete(verifyJWT, deleteStudent);

module.exports = router;
