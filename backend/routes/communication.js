const express = require("express");
const {
  sendMessage,
  getMessages,
} = require("../controllers/communication/communicationController");
const verifyJWT = require("../middleware/verifyJWT");
const authorize = require("../middleware/authorize");
const router = express.Router();

// Only teachers and admins can send/get messages
router.post(
  "/",
  verifyJWT,
  authorize(["teacher", "admin", "bursar"]),
  sendMessage
);
router.get(
  "/",
  verifyJWT,
  authorize(["teacher", "admin", "bursar"]),
  getMessages
);

module.exports = router;
