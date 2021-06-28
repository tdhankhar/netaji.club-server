const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const User = require("../models/user");

exports.login = (req, res) => {
  let user = new User(req.github_user);
  User.findOne({ github_id: user.github_id }, (err, user) => {
    if (err) {
      console.log(err);
      return res.redirect(`${process.env.FRONTEND_CLIENT_URL}/`);
    }
    if (!user) {
      let user = new User(req.github_user);
      user.save((err, user) => {
        if (err) {
          console.log(err);
          return res.redirect(`${process.env.FRONTEND_CLIENT_URL}/`);
        }
        req.github_user._id = user._id;
        let token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
        res.cookie("token", token, { expire: new Date() + 9999 });
        res.cookie("user", req.github_user);
        res.redirect(`${process.env.FRONTEND_CLIENT_URL}/home`);
      });
    } else {
      req.github_user._id = user._id;
      let token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
      res.cookie("token", token, { expire: new Date() + 9999 });
      res.cookie("user", req.github_user);
      res.redirect(`${process.env.FRONTEND_CLIENT_URL}/home`);
    }
  });
};

exports.getGithubAccessToken = (req, res, next) => {
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: req.query.code,
    }),
  })
    .then((response) => response.json())
    .then((response) => {
      req.access_token = response.access_token;
      next();
    });
};

exports.getGithubUser = (req, res, next) => {
  fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${req.access_token}`,
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((response) => {
      let user = {
        github_id: response.id,
        username: response.login,
        avatar_url: response.avatar_url,
        bio: response.bio,
        node_id: response.node_id,
        followers: response.followers,
        following: response.following,
      };
      req.github_user = user;
      next();
    });
};

exports.githubLogin = (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&
    scope=user`
  );
};
exports.githubLogout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("user");
  res.status(200).json({
    msg: "Logout Successful",
  });
};

// protection middlewares
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET_KEY,
  userProperty: "auth",
});

// custom middlewares
exports.isAuthenticated = (req, res, next) => {
  // check if token id matches the profile id or not
  let check = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!check) {
    return res.status(403).json({
      err: "ACCESS DENIED!",
    });
  }
  next();
};
