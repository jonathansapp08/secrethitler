const server = require('express')();
const http = require('http').createServer(server);
const randomstring = require('randomstring');
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
    }
});

const rooms = {};

io.on('connection', function (socket) {
    console.log('Connection established');

    socket.on('createGame', function (data) {
        const roomID=randomstring.generate({length: 4, charset: 'alphabetic'});
        socket.join(roomID);

        rooms[roomID]={[data.username]: socket.id};

        socket.broadcast.emit('receive', 'Other players can join with: ' + roomID);
        socket.broadcast.emit('receive', data.username + ' joined!');
        socket.emit('newGame', roomID);
        console.log(data.username + ' created room ' + roomID);
    });

    socket.on('joinGame', function (data) {
        socket.join(data.roomID);
        roomID = data.roomID;
        username = data.username;

        rooms[roomID][username] = socket.id;

        socket.broadcast.emit('receive', data.username + ' joined!');
        console.log(data.username + ' joined room ' + roomID);
    });

    socket.on('disconnect', function (data) {
        try {
            for (let value in rooms[roomID]){
                if (rooms[roomID][value] == socket.id){
                    socket.broadcast.emit('receive', value + ' disconnected!');
                    delete rooms[roomID][value];
                    console.log(value + ' left room ' + roomID);
                    break;
                }
            }
        }
        catch{
            console.log('Not in a game');
        }
    });

    socket.on('send_message', function (username, text) {
        let newText = username + ': ' + text;
        io.emit('receive', newText);
    });

});

http.listen(3000, function () {
    console.log('Server started!');
});
