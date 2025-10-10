const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const {
  getAllCredits,
  createCredit,
  updateCredit,
  deleteCredit,
} = require("../controllers/fee/creditsController");

const router = express.Router();

// list, create, update, delete
router.get("/all", verifyJWT, getAllCredits);
router.post("/", verifyJWT, createCredit);
router.put("/:id", verifyJWT, updateCredit);
router.delete("/:id", verifyJWT, deleteCredit);

module.exports = router;
