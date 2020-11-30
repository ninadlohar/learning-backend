const mongoose = require("mongoose");
const moment = require("moment");

let blogSchema = new mongoose.Schema({
  blogId: { type: String, unique: true },
  title: {
    type: String,
    maxlength: 30,
    default: "",
  },
  userId: {
    type: String,
  },
  description: {
    type: String,
    maxlength: 30,
    default: "",
  },
  views: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  tags: [],
  created: {
    type: Number,
    default: moment().unix(),
  },
  lastModified: {
    type: Number,
    default: moment().unix(),
  },
  postedUserId: { type: String, ref: "User" },
});

mongoose.model("Blog", blogSchema);
