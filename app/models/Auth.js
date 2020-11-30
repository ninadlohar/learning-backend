const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
const time = require("../lib/timeLib");

const Auth = new mongoose.Schema({
  userId: {
    type: String,
  },
  authToken: {
    type: String,
  },
  tokenSecret: {
    type: String,
  },
  tokenGenerationTime: {
    type: Date,
    default: time.now(),
  },
});

mongoose.model("Auth", Auth);
