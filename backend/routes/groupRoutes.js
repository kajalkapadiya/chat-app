const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

router.post("/createGroup", groupController.createGroup);
router.post("/joinGroup", groupController.joinGroup);

module.exports = router;
