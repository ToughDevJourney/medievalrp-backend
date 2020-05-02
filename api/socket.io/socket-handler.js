const socket = require('socket.io');
const server = require('../../server');
const io = socket(server);
let allClients = [];


io.sockets.on('connection', (socket) => {
    
    socket.emit('player connection', socket.id);
    socket.on('player connected', (player) => {          
        console.log("array", allClients)     
        socket.emit('add all players', allClients);
        allClients.push(player); 
        socket.broadcast.emit('new player connected', player);
      //  console.log("New Player connected! Players Array:")
     //   console.log(allClients)
    })     
    
    socket.on('move player', (data) => {
        console.log(data)
        let playerIndex = allClients.findIndex(el => el.socketId === data.socketId);
        if (playerIndex !== -1) {
            if (allClients[playerIndex].direction !== data.direction) {
                allClients[playerIndex].direction = data.direction;
                allClients[playerIndex].xPos -= 50 * data.direction;
            }
            allClients[playerIndex].xPos += 10 * data.direction;

            io.sockets.emit('move player', {xPos: allClients[playerIndex].xPos, socketId: data.socketId, direction: data.direction });
        }            
    })

    socket.on('disconnect', () => {
        console.log('Got disconnect!');

        var i = allClients.indexOf(socket.id);
        allClients.splice(i, 1);
    });
});



