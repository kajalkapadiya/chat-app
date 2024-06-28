const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("./config/mongoConfig");
require("./sockets/socket");
const userRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const groupMessages = require("./routes/messageRoutes");

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: "http://localhost:5173", // Update with your actual frontend origin
  methods: ["GET", "POST"],
  credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use("/", userRoutes);
app.use("/", groupRoutes);
app.use("/api", groupMessages);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
