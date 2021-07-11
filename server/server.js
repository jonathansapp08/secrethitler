const server = require('express')();
const http = require('http').createServer(server);
const { Console } = require('console');
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

        rooms[roomID] = {}
        rooms[roomID]['players']={[data.username]: socket.id};

        io.to(socket.id).emit('receive', 'Other players can join with: ' + roomID);
        io.to(socket.id).emit('receive', data.username + ' joined!');
        io.to(socket.id).emit('newGame', roomID);
        io.to(socket.id).emit('ishost', true);
        console.log(data.username + ' created room ' + roomID);
        io.in(roomID).emit('listPlayer', rooms[roomID]['players']);
    });

    socket.on('joinGame', function (data) {
        socket.join(data.roomID);
        roomID = data.roomID;
        username = data.username;

        rooms[roomID]['players'][username] = socket.id;

        io.in(roomID).emit('receive', data.username + ' joined!');
        console.log(data.username + ' joined room ' + roomID);

        if (Object.keys(rooms[roomID]['players']).length < 10){
            io.in(roomID).emit('listPlayer', rooms[roomID]['players']);
            io.in(roomID).emit('playerCount', rooms[roomID]['players']);
        }
    });

    socket.on('disconnect', function () {
        try {
            for (let value in rooms[roomID]){
                if (rooms[roomID][value] == socket.id){
                    io.in(roomID).emit('receive', value + ' disconnected!');
                    delete rooms[roomID][value];
                    console.log(value + ' left room ' + roomID);
                    io.in(roomID).emit('listPlayer', rooms[roomID]);
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


// FOR THE GAME
    socket.on('hostStart', (players) => {
        io.in(roomID).emit('showBoard');
        secret(roomID, players);
    });


    // Select chancellor????
    socket.on('receivePick', (username) => {
        console.log("player voted", username)
        // votes.push(vote);

    });

    socket.on('receiveVote', (vote) => {
        rooms[roomID]['vote'] = [];
        rooms[roomID]['vote'].push(vote);
    });


});






function secret(roomID, players){

    console.log(players)

    // while (true) {
        // Assigning Roles
        // assignRoles(roomID);

        // Pick a chancellor
        assignChancellor(players);




        // End turn
        endTurn(players);
    // }






    // Pick chancellor


    // VOTING
    io.in(roomID).emit('receive', 'Vote yes or no');
    io.in(roomID).emit('showVote');


    // WAIT UNTIL ALL PLAYERS HAVE SELECTED
    // while (rooms[roomID]['votes'] != Object.keys(players).length){
    //     console.log(rooms[roomID]['vote']);
    // }

}



function assignRoles(players){
    if (Object.keys(players).length == 2){
        const roles=['Liberal', 'Liberal', 'Liberal', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 6){
        const roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 7){
        const roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 8){
        const roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 9){
        const roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 10){
        const roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Hitler'];
    }

    const badGuys = [];

    for (let key in players){
        var randomAssign = roles[Math.floor(Math.random() * roles.length)];

        io.to(players[key]).emit('receive', 'You are ' + randomAssign);
        // Get bad guys
        if (randomAssign == 'Fascist' || randomAssign == 'Hitler'){
            badGuys.push(key)
        }
        roles.indexOf(randomAssign) !== -1 && roles.splice(roles.indexOf(randomAssign), 1)
    } 
    //Let bad guys know who other bad guyas are
    for (let key in players){
        if (badGuys.includes(key)){
            io.to(players[key]).emit('receive', 'The "bad guys" are ' + badGuys);
        }
    }







}

function assignChancellor(players){
    for (let player in players){
        console.log(players[player]);
        break
    }
    // console.log(players[Object.keys(players)[0]]);


}

function endTurn(players){
    // console.log(players);
    // var first = players[0];
    // players.shift();

    // players.push(first);

    // console.log(players);

}




// 3. Vote yes or no
//     1. If majority yes then pass
//     2. Else break and go back to step one with new President
// 4. If 3 fascist cards down, ask it chancellor is hitler
//     1. If yes end game
//     2. Else pass
// 5. President draws thee cards
// 6. President discards one card
// 7. Chancellor takes the two leftover cards
// 8. If 5 fascist cards chancellor can request veto
//     1. If president agrees, break
// 9. Chancellor plays one card
// 10. Did the liberal board get full?
//     1. Yes end game
//     2. No continue
// 11. Did fascist board get full?
//     1. Yes end game
//     2. No check for executive power
//     3. Enact executive power
// 12. Check cards
//     1. If fewer than 3, shuffle everything





http.listen(3000, function () {
    console.log('Server started!');
});
