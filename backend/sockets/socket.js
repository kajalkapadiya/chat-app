const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Group = require("../models/Group");
const ChatMessage = require("../models/ChatMessage");

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.id;

    try {
      const user = await User.findById(socket.userId);
      if (user) {
        socket.userDetails = {
          id: user._id,
          name: user.name,
        };
        next();
      } else {
        next(new Error("User not found"));
      }
    } catch (error) {
      next(new Error("Internal Server Error"));
    }
  });
});

io.on("connection", async (socket) => {
  const userId = socket.userId;
  const userDetails = socket.userDetails;

  if (!onlineUsers.some((user) => user.id === userId)) {
    onlineUsers.push(userDetails);
  }
  const allUsers = await User.find({});
  io.emit("users", { onlineUsers: onlineUsers, allUsers: allUsers });

  try {
    const userGroups = await Group.find({ members: userId });
    socket.emit("groups", { groups: userGroups });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    socket.emit("groups", { groups: [] });
  }

  socket.on("getGroupMembers", async (groupId) => {
    const group = await Group.findById(groupId).populate("members");
    if (group) {
      const groupMembers = group.members.map((member) => ({
        _id: member._id,
        name: member.name,
      }));
      socket.emit("groupMembers", { groupId, members: groupMembers });
    }
  });

  socket.on("sendMessage", async ({ groupId, message }) => {
    const chatMessage = new ChatMessage({
      groupId,
      userId,
      userName: userDetails.name,
      message,
    });

    await chatMessage.save();
    io.to(groupId).emit("message", chatMessage);
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.id !== userId);
    io.emit("users", { onlineUsers: onlineUsers, allUsers: allUsers });
  });
});

module.exports = io;
