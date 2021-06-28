require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const socket = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const spaceRoutes = require("./routes/space");
const { Space, UserInSpace } = require("./models/space");
const User = require("./models/user");

const app = express();

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB CONNECTED!!");
  });

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use("/api/v1", authRoutes);
app.use("/api/v1", spaceRoutes);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`SERVER IS RUNNING ON PORT: ${port}`);
});

const io = socket(server);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("visit", ({ space_id, user_id }) => {
    Space.findById(space_id).exec((err, space) => {
      if (err) {
        return socket.emit("error", {
          username: "admin",
          text: `Internal Server Error`,
        });
      }
      User.findById(user_id).exec((err, user) => {
        if (err) {
          return socket.emit("error", {
            username: "admin",
            text: `Internal Server Error`,
          });
        }
        const index = space.users.findIndex((user) => user._id == user_id);
        if (index !== -1) {
          return socket.emit("error", {
            username: "admin",
            text: `User already present in the space`,
          });
        }
        space.users.push(new UserInSpace(user));
        space.save((err, space) => {
          if (err) {
            return socket.emit("error", {
              username: "admin",
              text: `Internal Server Error`,
            });
          }
          socket.emit("welcome", {
            body: { space },
          });
          socket.emit("message", {
            username: "admin",
            text: `Hey! We are so glad to see you here. Have fun!`,
          });
          socket.broadcast.to(space_id).emit("new_user", {
            body: { user },
          });
          socket.broadcast.to(space_id).emit("message", {
            username: "admin",
            text: `${user.username} has joined!`,
          });
          socket.join(space_id);
        });
      });
    });
  });

  socket.on("sendMessage", ({ space_id, username, text }, next) => {
    io.to(space_id).emit("message", { username, text });
    next();
  });

  socket.on("leave", ({ space_id, user_id }, next) => {
    Space.findById(space_id).exec((err, space) => {
      if (err) {
        // TODO: handle these error in frontend
        return console.log(err);
      }
      const index = space.users.findIndex((user) => user._id == user_id);
      if (index !== -1) {
        const username = space.users[index].username;
        space.users.splice(index, 1);
        space.save((err, space) => {
          if (err) {
            // TODO: handle these error in frontend
            return console.log(err);
          }
          socket.broadcast.to(space_id).emit("user_left", {
            body: { user_id },
          });
          socket.broadcast.to(space_id).emit("message", {
            username: "admin",
            text: `${username} left!`,
          });
          next();
        });
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
