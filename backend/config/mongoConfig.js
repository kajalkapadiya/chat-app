// backend/mongoConfig.js

const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.MONGODB_LINK;

mongoose.set("strictQuery", true);
mongoose
  .connect(url, {})
  .then(() => {
    console.log("connect successfully!");
  })
  .catch((err) => {
    console.log(err, "no connection");
  });
