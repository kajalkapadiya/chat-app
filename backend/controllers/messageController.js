const ChatMessage = require("../models/ChatMessage");

exports.getGroupMessages = async (req, res) => {
  const { groupId, since } = req.query;
  let query = { groupId };
  if (since) {
    query.timestamp = { $gt: new Date(since) };
  }
  try {
    const messages = await ChatMessage.find(query);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
