const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, index: true },
  name: {
    type: String,
    maxlength: 30,
    default: "",
  },
  email: {
    type: String,
    maxlength: 30,
    default: "",
  },
  password: {
    type: String,
    default: 0,
  },
  blogs: [
    {
      type: String,
      ref: "Blog",
    },
  ],
});

mongoose.model("User", UserSchema);
