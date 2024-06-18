const mongoose = require("mongoose");

//mongoose.Schema is a constructor used to create a new schema object.
//The schema object defines the structure of the documents. Here, it specifies that each user document will have name, email, phone, and password fields.
//mongoose.model is used to create a model from the schema. A model is a class that we can use to create and read documents from the corresponding collection.

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
