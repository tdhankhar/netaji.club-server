const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    bio: {
      type: String,
      trim: true,
    },
    avatar_url: {
      type: String,
      trim: true,
      required: true,
    },
    github_id: {
      type: Number,
      required: true,
    },
    node_id: {
      type: String,
      trim: true,
      required: true,
    },
    followers: {
      type: Number,
      trim: true,
    },
    following: {
      type: Number,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
