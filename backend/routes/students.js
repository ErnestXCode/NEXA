const express = require("express");
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/students/studentController");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const router = express.Router();

router.route("/").get(getAllStudents).post(verifyJWT , createStudent);

router
  .route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
