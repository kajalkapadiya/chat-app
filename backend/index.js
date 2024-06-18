// backend/index.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./User");
require("./mongoConfig");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log({ name, email, phone, password });
  // Here, you would normally handle user registration, e.g., save to a database

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).send("User registered successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
