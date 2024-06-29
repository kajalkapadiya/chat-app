const Group = require("../models/Group");
const User = require("../models/User");

exports.createGroup = async (req, res) => {
  const { name, userId } = req.body;
  try {
    const group = new Group({ name, members: [userId], admins: [userId] });
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
      console.log(`userId ${userId} added`);
      group.members.push(userId);
      await group.save();
    }
    res.status(200).json(group); // Return the joined group
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.addMember = async (req, res) => {
  const { groupId, memberIdentifier, adminId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.admins.includes(adminId)) {
      return res.status(403).json({ message: "You are not an admin" });
    }

    const user = await User.findOne({
      $or: [{ name: memberIdentifier }, { email: memberIdentifier }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!group.members.includes(user._id)) {
      group.members.push(user._id);
      await group.save();
    }

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "name") // Assuming 'members' is an array of user IDs
      .populate("admins", "name");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeMember = async (req, res) => {
  console.log("Remove member request received");
  console.log(req.body);

  const { groupId, memberId, adminId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group.admins.includes(adminId)) {
      return res.status(403).send("Only admins can remove members");
    }
    group.members = group.members.filter((id) => id.toString() !== memberId);
    group.admins = group.admins.filter((id) => id.toString() !== memberId);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.makeAdmin = async (req, res) => {
  console.log("makeAdmin");
  const { groupId, memberId, adminId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group.admins.includes(adminId)) {
      return res.status(403).send("Only admins can make other admins");
    }
    if (!group.admins.includes(memberId)) {
      group.admins.push(memberId);
      await group.save();
    }
    res.status(200).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
