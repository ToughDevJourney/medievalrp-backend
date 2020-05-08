const socket = require("socket.io");
const server = require("../../server");
const io = socket(server);
let allPlayers = [];
let playersMoveQueue = new Set();

io.sockets.on("connection", (socket) => {
  socket.emit("player connection", {
    socketId: socket.id,
    playersArr: allPlayers,
  });
  socket.on("player connected", (player) => playerConnected(socket, player));
  socket.on("player walk", (data) => movePlayer(data));
  socket.on("player idle", (socketId) => idlePlayer(socketId));
  socket.on("disconnect", () => disconnect(socket));
});

function playerConnected(socket, player) {
  allPlayers.push(player);
  socket.broadcast.emit("new player connected", player);
}

function movePlayer(data) {
  let playerIndex = allPlayers.findIndex((el) => el.socketId === data.socketId);

  if (playerIndex !== -1) {
    let player = allPlayers[playerIndex];
    if (player.direction !== data.direction) {
      player.direction = data.direction;
      player.xPos -= 70 * data.direction;
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
      player.xPos += 10 * player.direction;

      io.sockets.emit("move player", {
        xPos: player.xPos,
        socketId: player.socketId,
        direction: player.direction,
      });
    }    
  }
  setTimeout(() => movePlayerShedule(), 50);
}

movePlayerShedule();