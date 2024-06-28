const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.get("/groupMessages", messageController.getGroupMessages);

module.exports = router;
