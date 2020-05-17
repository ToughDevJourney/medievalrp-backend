const jwt = require("jsonwebtoken");
const User = require("../models/user");

const socket = require("socket.io");
const server = require("../../server");
const io = socket(server);
let allPlayers = [];
let playersMoveQueue = new Set();

io.sockets.on("connection", (socket) => {
  socket.emit("request access token");
  socket.on("response access token", (accessToken) => authPlayer(socket, accessToken));
  socket.on("player walk", (direction) => movePlayer(direction, socket.id));
  socket.on("player idle", () => idlePlayer(socket.id));
  socket.on("disconnect", () => disconnect(socket));
});


function authPlayer(socket, accessToken){
  try {   
    const decoded = jwt.verify(accessToken, process.env.JWT_KEY);
    let data = decoded;
    getUserData(socket, data.userId)
  } catch (e) {
    console.log(e)
    socket.emit("jwt expired");
  }
}

function getUserData(socket, userId){
  User.findOne({ _id: userId })
    .select("nickname skin")
    .then((userInfo) => {
      if (userInfo) {
        let newPlayer = {
          _id: userInfo._id,
          socketId: socket.id,
          nickname: userInfo.nickname,
          skin: userInfo.skin,
          xPos: 960,
          yPos: 0,
          direction: 1,
        };
        playerConnected(socket, newPlayer)
        socket.emit("player connection", {
          playersArr: allPlayers,
          userInfo,
        });
      }
      else{
        socket.emit("user not found");        
      }
    })
    .catch((e) => {
      console.log(e)
    });
}

function playerConnected(socket, player) {
  allPlayers.unshift(player);
  socket.broadcast.emit("new player connected", player);
}

function movePlayer(direction, socketId) {
  let playerIndex = allPlayers.findIndex((el) => el.socketId === socketId);

  if (playerIndex !== -1) {
    let player = allPlayers[playerIndex];
    if (player.direction !== direction) {
      player.direction = direction;
      player.xPos -= 70 * direction;
    }

    if (!playersMoveQueue.has(player)) {
      playersMoveQueue.add(player);
    }
  }
}

function idlePlayer(socketId) {
  let player = allPlayers.find((el) => el.socketId === socketId);
  if (player !== undefined) {
    playersMoveQueue.delete(player);
  }
}

function disconnect(socket) {
  let playerIndex = allPlayers.findIndex((el) => el.socketId === socket.id);
  allPlayers.splice(playerIndex, 1);
  socket.broadcast.emit("delete player", socket.id);
}


function movePlayerShedule() {
  for (let player of playersMoveQueue) {      
    if (player !== undefined) {
      player.xPos += 15 * player.direction;

      io.sockets.emit("move player", {
        xPos: player.xPos,
        socketId: player.socketId,
        direction: player.direction,
      });
    }    
  }
  setTimeout(() => movePlayerShedule(), 40);
}

movePlayerShedule();