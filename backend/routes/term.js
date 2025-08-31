const express = require("express");

const verifyJWT = require("../middleware/verifyJWT");
const { createTerm } = require("../controllers/term/termController");

const router = express.Router();

router.route("/").post(verifyJWT , createTerm);

module.exports = router;
