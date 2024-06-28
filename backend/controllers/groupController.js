const Group = require("../models/Group");

exports.createGroup = async (req, res) => {
  const { name, userId } = req.body;
  try {
    const group = new Group({ name, members: [userId] });
    await group.save();
    res.status(201).json(group); // Return the created group
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.joinGroup = async (req, res) => {
  const { groupId, userId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    res.status(200).json(group); // Return the joined group
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
