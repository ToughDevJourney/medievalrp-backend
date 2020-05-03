const socket = require('socket.io');
const server = require('../../server');
const io = socket(server);
let allClients = [];


io.sockets.on('connection', (socket) => {
    socket.emit('player connection', { socketId: socket.id, playersArr: allClients});
    socket.on('player connected', (player) => {                   
        allClients.push(player); 
       // socket.emit('add all players', allClients);
        socket.broadcast.emit('new player connected', player);
    })     
    
    socket.on('move player', (data) => {
        let playerIndex = allClients.findIndex(el => el.socketId === data.socketId);
        if (playerIndex !== -1) {
            if (allClients[playerIndex].direction !== data.direction) {
                allClients[playerIndex].direction = data.direction;
                allClients[playerIndex].xPos -= 50 * data.direction;
            }
            allClients[playerIndex].xPos += 10 * data.direction;

            io.sockets.emit('move player', {xPos: allClients[playerIndex].xPos, socketId: data.socketId, direction: data.direction });
        }
        else{
            console.log(data.socketId);
        }            
    })

    socket.on('disconnect', () => {        
        socket.broadcast.emit('delete player', socket.id);
      //  var i = allClients.indexOf(socket.id);
        let playerIndex = allClients.findIndex(el => el.socketId === socket.id);
        console.log("to delete", socket.id)
        console.log(playerIndex)
        console.log("before", allClients)
        allClients.splice(playerIndex, 1);
        console.log("after", allClients)
    });
});



