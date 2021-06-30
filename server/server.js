const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
    }
});

players = []

io.on('connection', function (socket) {
    console.log('A user connected: ' + socket.id);

    socket.on('join', function (data) {
        console.log('A user connected: ' + socket.id);
        socket.broadcast.emit('receive', data.username + ' joined!');
        players.push({"socket_id":socket.id,"username":data.username})
    });

    socket.on('disconnect', function (data) {
        console.log('A user disconnected: ' + socket.id);

        for (var i = 0; i < players.length; i++){
            if (players[i].socket_id == socket.id){
                socket.broadcast.emit('receive', players[i].username + ' disconnected!');
                players.splice(i, 1);
            }
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