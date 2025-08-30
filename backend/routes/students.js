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

router.route("/").get(verifyJWT, getAllStudents).post(verifyJWT , createStudent);

router
  .route("/:id")
  .get(verifyJWT, getStudentById)
  .put(verifyJWT, updateStudent)
  .delete(verifyJWT, deleteStudent);

module.exports = router;
