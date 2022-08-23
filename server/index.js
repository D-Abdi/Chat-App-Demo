const express = require("express");
const app = express();
const PORT = 4000;

const http = require("http").Server(app);
const cors = require("cors");
const fs = require("fs");

const rawData = fs.readFileSync("messages.json");
const messagesData = JSON.parse(rawData);
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());
let users = [];

socketIO.on("connection", (socket) => {
  console.log(`🔥 : ${socket.id} user has just connected!`);

  // Listens and logs the message to the console
  socket.on("message", (data) => {
    messagesData["messages"].push(data);
    const stringData = JSON.stringify(messagesData, null, 2);
    fs.writeFile("messages.json", stringData, (err) => {
      console.log(err, "ERROR");
    });
    socketIO.emit("messageResponse", data);
  });

  socket.on("typing", (data) => socket.broadcast.emit("typingResponse", data));

  socket.on("newUser", (data) => {
    users.push(data);
    console.log(users, "Users");
    socketIO.emit("newUserResponse", users);
  });

  socket.on("disconnect", (data) => {
    console.log(`👋 : ${socket.id} user has just disconnected!`);
    users = users.filter((user) => user.socketID !== socket.id);
    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
});

app.get("/api", (req, res) => {
  res.json(messagesData);
});

http.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
