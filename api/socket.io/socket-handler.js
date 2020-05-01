const socket = require('socket.io');
const server = require('../../server');
const io = socket(server);
let allClients = [];


io.sockets.on('connection', (socket) => {

    allClients.push(socket.id);

    console.log("New Player connected! Players Array:")
    for (let soc of allClients) {
        console.log(soc, allClients.indexOf(soc))
    }

    socket.on('move player', (action) => {
        io.sockets.emit('move player', action);
    })

    io.sockets.emit('new player connected', socket.id);
    socket.emit('player connection', socket.id);


    socket.on('disconnect', () => {
        console.log('Got disconnect!');

        var i = allClients.indexOf(socket.id);
        allClients.splice(i, 1);
    });
});



