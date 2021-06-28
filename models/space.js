const mongoose = require("mongoose");

const userInSpaceSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
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
  },
  { timestamps: true }
);

const UserInSpace = mongoose.model("UserInSpace", userInSpaceSchema);

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    description: {
      type: String,
      trim: true,
    },
    users: [userInSpaceSchema],
  },
  { timestamps: true }
);

const Space = mongoose.model("Space", spaceSchema);

module.exports = { Space, UserInSpace };
