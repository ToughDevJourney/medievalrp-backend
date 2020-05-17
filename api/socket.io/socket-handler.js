const jwt = require("jsonwebtoken");
const User = require("../models/user");

const socket = require("socket.io");
const server = require("../../server");
const io = socket(server);
let allClients = [];
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
        let allPlayers = allClients.map(el => el.player);
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
  allClients = allClients.filter((el) => filterDisconnectSocket(el, player._id.toString()))  
  allClients.unshift({ player, socket });
  socket.broadcast.emit("new player connected", player);
}

function filterDisconnectSocket(client, playerId){
  if(client.player._id.toString() == playerId){    
    io.sockets.emit("delete player", client.socket.id);
    client.socket.disconnect(true);
    return false;
  }
  return true;
}

function movePlayer(direction, socketId) {
  let player = allClients.find((el) => el.socket.id === socketId).player;

  if (player) {
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
  let player = allClients.find((el) => el.socket.id === socketId).player;

  if (player) {
    playersMoveQueue.delete(player);
  }
}

function disconnect(socket) {
  let playerIndex = allClients.findIndex((el) => el.socket.id === socket.id);
  allClients.splice(playerIndex, 1);
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