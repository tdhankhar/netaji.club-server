const express = require("express");
const router = express.Router();

const {
  getGithubAccessToken,
  getGithubUser,
  githubLogin,
  githubLogout,
  login,
  isSignedIn,
  isAuthenticated,
} = require("../controllers/auth.js");

router.get("/login/github", githubLogin);
router.get(
  "/login/github/callback",
  getGithubAccessToken,
  getGithubUser,
  login
);
router.get("/logout/github", isSignedIn, isAuthenticated, githubLogout);

module.exports = router;
