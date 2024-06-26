const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./User");
const ChatMessage = require("./ChatMessage");
require("./mongoConfig");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: "http://localhost:5173", // Update with your actual frontend origin
  methods: ["GET", "POST"],
  credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log({ name, email, phone, password });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).send("User registered successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/messages", async (req, res) => {
  const since = req.query.since;
  let query = {};
  if (since) {
    query = { timestamp: { $gt: new Date(since) } };
  }
  try {
    const messages = await ChatMessage.find(query);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const server = require("http").createServer(app);
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

  socket.on("sendMessage", async (message) => {
    io.emit("message", { user: userDetails.name, text: message });
    // Save the message to the database
    const chatMessage = new ChatMessage({
      userId: userId,
      userName: userDetails.name,
      message: message,
    });
    await chatMessage.save();
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.id !== userId);
    io.emit("users", { onlineUsers: onlineUsers, allUsers: allUsers });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
