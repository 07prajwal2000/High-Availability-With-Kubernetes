const { Server, matchMaker } = require("colyseus");
const { createServer } = require("http");
const TopDownRoom = require("./rooms/topDownRoom.js");
const path = require("path");
const { totalClients } = require("./rooms/vars.js");
const express = require("express");

const app = express();
const server = createServer(app);
const colyseusServer = new Server({ server });

colyseusServer.define("top-down-room", TopDownRoom).setMaxListeners(5);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  return next();
});
app.get("/game", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "/html", "index.html"));
});
app.use(express.static(path.join(__dirname, "static"), {index: "index.html"}));
app.get("/health", (req, res) => {
  res.json();
});

const matches = [];

app.get("/create-room", async (req, res) => {
  const result = await matchMaker.createRoom("top-down-room");
  matches.push(result.roomId);
  return res.json({
    id: result.roomId,
    roomName: result.name
  });
});

app.get("/get-rooms", (req, res) => {
  res.json(matches);
});

app.get("/stats", (req, res) => {
  res.json(totalClients);
});

colyseusServer.listen(3000, () => {
  console.log("Server listening in http://localhost:3000");
});