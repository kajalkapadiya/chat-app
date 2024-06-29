const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

router.post("/createGroup", groupController.createGroup);
router.post("/joinGroup", groupController.joinGroup);
router.post("/addMember", groupController.addMember);
router.post("/removeMember", groupController.removeMember);
router.post("/makeAdmin", groupController.makeAdmin);

module.exports = router;
