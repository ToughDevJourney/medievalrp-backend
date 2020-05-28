const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { secretKey } = require("../../config");

const socket = require("socket.io");
const server = require("../../server");
const io = socket(server);

const playerWidth = 0;
const playerStep = 15;
let allClients = [];
let playersMoveQueue = new Set();

try {
  io.sockets.on("connection", (socket) => {
    socket.emit("request access token");
    socket.on("response access token", (accessToken) =>
      authPlayer(socket, accessToken)
    );
    socket.on("new message", (message) => newMessage(socket, message));
    socket.on("player walk", (direction) => movePlayer(socket.id, direction));
    socket.on("player idle", () => idlePlayer(socket.id));
    socket.on("disconnect", () => disconnect(socket));
  });

  function authPlayer(socket, accessToken) {
    try {
      const decoded = jwt.verify(accessToken, secretKey);
      let data = decoded;
      getUserData(socket, data.userId);
    } catch (e) {
      socket.emit("jwt expired");
      socket.disconnect(true);
    }
  }

  function getUserData(socket, userId) {
    User.findOne({ _id: userId })
      .select("nickname skin")
      .then((userInfo) => {
        if (userInfo) {
          connectPlayer(socket, userInfo);
        } else {
          socket.emit("user not found");
          socket.disconnect(true);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }

  function connectPlayer(socket, userInfo) {
    let info = setDefaultClientInfo();
    let player = setDefaultPlayerInfo(userInfo, socket);

    allClients = allClients.filter((el) =>
      disconnectSamePlayer(el, player._id.toString())
    );

    allClients.unshift({ player, socket, info });
    socket.broadcast.emit("new player connected", player);

    //отправка новому игроку массив всех подключенных игроков
    let allPlayers = allClients.map((el) => el.player);
    socket.emit("player connection", {
      playersArr: allPlayers,
      userInfo,
    });
  }

  function setDefaultPlayerInfo(userInfo, socket) {
    return {
      _id: userInfo._id,
      socketId: socket.id,
      nickname: userInfo.nickname,
      skin: userInfo.skin,
      xPos: 960,
      yPos: 0,
      direction: 1,
    };
  }

  function setDefaultClientInfo(){
    return {
      recentMessagesNum: 0
    }
  }

  function disconnectSamePlayer(client, playerId) {
    if (client.player._id.toString() == playerId) {
      io.sockets.emit("delete player", client.socket.id);
      client.socket.disconnect(true);
      return false;
    }
    return true;
  }

  function newMessage(socket, message){
    let player = allClients.find((el) => el.socket.id === socket.id);

    if(message.text.length > 0 && message.text.length <= 70){
      if(player.info.recentMessagesNum < 5){
        player.info.recentMessagesNum++;
        io.sockets.emit("new message", { ...message, socketId: socket.id });
        setTimeout(() => messagesCooldown(player), 5000);
      }
      else{
        socket.emit("new message", { nickname: "Система", text: "Говорите мееееедленнееееее..." });
      }
    }    
  }

  function messagesCooldown(player) {
    player.info.recentMessagesNum--;
  }

  function movePlayer(socketId, direction) {
    let player = allClients.find((el) => el.socket.id === socketId);

    if (player) {
      player = player.player;
      if (player.direction !== direction) {
        player.direction = direction;
        player.xPos -= playerWidth * direction;
      }

      if (!playersMoveQueue.has(player)) {
        playersMoveQueue.add(player);
      }
    }
  }

  function idlePlayer(socketId) {
    let player = allClients.find((el) => el.socket.id === socketId);

    if (player) {
      player = player.player;
      playersMoveQueue.delete(player);
    }
  }

  function disconnect(socket) {
    let playerIndex = allClients.findIndex((el) => el.socket.id === socket.id);
    if(playerIndex != -1){
      allClients.splice(playerIndex, 1);
    }
    socket.broadcast.emit("delete player", socket.id);
  }

  function movePlayerShedule() {
    for (let player of playersMoveQueue) {
      if (player) {
        player.xPos += playerStep * player.direction;

        if (player.direction === 1) {
          if (player.xPos > 1920 - playerWidth) {
            player.xPos = 1920 - playerWidth;
          }
        } else if (player.direction === -1) {
          if (player.xPos < playerWidth) {
            player.xPos = playerWidth;
          }
        } else {
          continue;
        }

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
} catch (e) {
  console.log(e);
}
