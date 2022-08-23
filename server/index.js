const express = require("express");
const app = express();
const PORT = 4000;

const http = require("http").Server(app);
const cors = require("cors");

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

socketIO.on("connection", (socket) => {
  console.log(`🔥 : ${socket.id} user has just connected!`);

  // Listens and logs the message to the console
  socket.on("message", (data) => {
    console.log(data, "Data");
    socketIO.emit("messageResponse", data);
  });

  socket.on("typing", (data) => socket.broadcast.emit("typingResponse", data));

  socket.on("newUser", (data) => {
    users.push(data);
    socketIO.emit("newUserResponse", users);
  });

  socket.on("disconnect", () => {
    console.log(`👋 : ${socket.id} user has just disconnected!`);
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
