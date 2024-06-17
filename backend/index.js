// backend/index.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/signup", (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log({ name, email, phone, password });
  // Here, you would normally handle user registration, e.g., save to a database
  res.status(200).send("User registered successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
