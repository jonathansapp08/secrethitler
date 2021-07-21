const server = require('express')();
const http = require('http').createServer(server);
const { fail } = require('assert');
const { Console } = require('console');
const randomstring = require('randomstring');
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
    }
});

var rooms = {};

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
        io.in(roomID).emit('hideRestart');
        io.in(roomID).emit('showBoard');

        rooms[roomID]['roles'] = {}
        rooms[roomID]['vote'] = {}
        rooms[roomID]['failCounter'] = 0
        rooms[roomID]['turnOrder'] = []
        rooms[roomID]['cards'] = []
        rooms[roomID]['chancellor'] = []
        rooms[roomID]['liberal'] = 0
        rooms[roomID]['fascist'] = 0
        rooms[roomID]['veto'] = 0


        for ( player in rooms[roomID]['players']){
            rooms[roomID]['turnOrder'].push(rooms[roomID]['players'][player]);
        }

        secret(roomID, players);
    });

     // Vote yes or no
     socket.on('receiveVote', (vote) => {      
        rooms[roomID]['vote'][socket.id] = vote;

        var yes = 0;
        var no = 0;
        
        // If there are equal number of votes as there are players
        if (Object.keys(rooms[roomID]['vote']).length == Object.keys(rooms[roomID]['players']).length){
            for (votes in rooms[roomID]['vote']){
                if (rooms[roomID]['vote'][votes] == 'y'){
                    yes += 1
                }
                else {
                    no += 1
                }
            }
            // If majority yes then pass
            if (yes > no) {
                io.in(roomID).emit('receive',"Vote Passes");
                // If >= 3 fascist cards and Chancellor is Hitler, end game
                if (rooms[roomID]['fascist'] >= 3) {
                    for (player in rooms[roomID]['roles']){
                        if (rooms[roomID]['roles'][player] == 'Hitler' && player == rooms[roomID]['chancellor'][0]){
                            io.in(roomID).emit('receive', rooms[roomID]['chancellor'][0] + " was Hitler");
                            io.in(roomID).emit('restartGame')
                            // endGame()
                            break
                        }
                    }
                }
                // Reset fail counter and give President Cards
                rooms[roomID]['failCounter'] = 0;
                var hand = drawCards(roomID, 3)
                io.to(rooms[roomID]['turnOrder'][0]).emit('receiveCards', hand);
            }
            // Else add to fail counter and end turn
            else {
                rooms[roomID]['chancellor'] = []
                io.in(roomID).emit('receive',"Vote Fails");
                // If vote fails three times in a row
                rooms[roomID]['failCounter'] += 1;
                if (rooms[roomID]['failCounter'] == 3){
                    drawCards(roomID, 1)
                    io.in(roomID).emit('receive',"Vote failed 3 times in a row...");
                    var hand = drawCards(roomID, 1)
                    // If card drawn is liberal
                    if (hand[0] == 'Liberal') {
                        rooms[roomID]['liberal'] += 1;
                        io.in(roomID).emit('addLiberal', rooms[roomID]['liberal']);
                    }
                    // If card drawn is fascist
                    else if (hand[0] == 'Fascist') {
                        rooms[roomID]['fascist'] += 1;
                        io.in(roomID).emit('addFascist', rooms[roomID]['fascist']);
                    }
                    rooms[roomID]['failCounter'] = 0;
                }
                endTurn(roomID);
            }
            rooms[roomID]['vote'] = {}
        }
    });

    socket.on('addVeto', () => {
        rooms[roomID]['veto'] += 1;

        if (rooms[roomID]['veto'] == 1) {
            io.in(roomID).emit('receive', 'Veto was proposed');
            io.to(rooms[roomID]['turnOrder'][0]).emit('presidentVeto');
        }
        
        if (rooms[roomID]['veto'] == 2) {
            io.in(roomID).emit('receive', 'Veto was successful');
            rooms[roomID]['chancellor'] = []
            endTurn(roomID);
        }
    });

    socket.on('failedVeto', () => {
        io.in(roomID).emit('receive', 'Veto unsuccessful');

        for (player in rooms[roomID]['players']){
            var chancellor = []
            chancellor.push(player);
            if (chancellor[0] == rooms[roomID]['chancellor'][0]) {
                io.in(roomID).emit('receive', 'Veto was declined');
                io.in(rooms[roomID]['players'][player]).emit('toggleHand');
                break
            }
            chancellor = []
        }
    });

    socket.on('passToChancellor', (hand) => {
        for (player in rooms[roomID]['players']){
            var chancellor = []
            chancellor.push(player);
            if (chancellor[0] == rooms[roomID]['chancellor'][0]) {
                io.to(rooms[roomID]['players'][player]).emit('receiveCards', hand);
                // Add veto power to chancellor if 5 fascist cards played
                if (rooms[roomID]['fascist'] == 5){
                    io.to(rooms[roomID]['players'][player]).emit('chancellorVeto');
                }
                break
            }
            chancellor = []
        }
    });

    socket.on('playCard', (card) => {
        if (card == 'Liberal'){
            rooms[roomID]['liberal'] += 1
            rooms[roomID]['chancellor'] = []
            io.in(roomID).emit('addLiberal', rooms[roomID]['liberal']);
            endTurn(roomID);
        }
        if (card == 'Fascist'){
            rooms[roomID]['fascist'] += 1
            rooms[roomID]['chancellor'] = []
            io.in(roomID).emit('addFascist', rooms[roomID]['fascist']);
            endTurn(roomID);
        }

        if (rooms[roomID]['liberal'] == 5){
            io.in(roomID).emit('receive', '5 liberal cards were played');
            socket.emit('endGame')
            // endGame()
        }
        
        if (rooms[roomID]['fascist'] == 6){
            io.in(roomID).emit('receive', '6 fascist cards were played');
            // io.in(roomID).emit('resetGame');
            endGame(roomID)
        }
    });

    socket.on('receivePick', (pick) => { 
        io.in(roomID).emit('receive',"Should " + pick + " become the chancellor?")
        io.in(roomID).emit('receive', 'Vote yes or no');
        io.in(roomID).emit('showVote');
        rooms[roomID]['chancellor'].push(pick);
    });

    socket.on('getPolicyCount', () => { 
        io.to(socket.id).emit('receive', 'Number of policies in deck: ' + rooms[roomID]['cards'].length);
    });




});






function secret(roomID, players){
    //Assigning Roles
    assignRoles(players);

    //Pick a chancellor
    assignChancellor(roomID);
}

function assignRoles(players){
    if (Object.keys(players).length == 2){
        var roles=['Liberal', 'Liberal', 'Liberal', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 6){
        var roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 7){
        var roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 8){
        var roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 9){
        var roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Hitler'];
    }
    if (Object.keys(players).length == 10){
        var roles=['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Hitler'];
    }

    
    const badGuys = [];

    for (let key in players){
        var randomAssign = roles[Math.floor(Math.random() * roles.length)];

        io.to(players[key]).emit('receive', 'You are ' + randomAssign);
        // Get bad guys
        if (randomAssign == 'Fascist' || randomAssign == 'Hitler'){
            badGuys.push(key)
        }

        rooms[roomID]['roles'][key] = randomAssign;


        roles.indexOf(randomAssign) !== -1 && roles.splice(roles.indexOf(randomAssign), 1)
    } 
    //Let bad guys know who other bad guyas are
    for (let key in players){
        if (badGuys.includes(key)){
            io.to(players[key]).emit('receive', 'The "bad guys" are ' + badGuys);
        }
    }
}

function assignChancellor(roomID){
    io.to(rooms[roomID]['turnOrder'][0]).emit('receive', 'Pick your chencellor');
    io.to(rooms[roomID]['turnOrder'][0]).emit('allowPick');
}

function endTurn(roomID){
    var first = []
    first = rooms[roomID]['turnOrder'][0];
    rooms[roomID]['turnOrder'].shift();
    rooms[roomID]['turnOrder'].push(first);
    
    rooms[roomID]['veto'] = 0;
    // Start next turn
    assignChancellor(roomID);
}

function endGame(roomID){
    console.log("ending game");
    console.log(roomID);

    rooms[roomID]['roles'] = {}
    rooms[roomID]['vote'] = {}
    rooms[roomID]['failCounter'] = 0
    rooms[roomID]['turnOrder'] = []
    rooms[roomID]['cards'] = []
    rooms[roomID]['chancellor'] = []
    rooms[roomID]['liberal'] = 0
    rooms[roomID]['fascist'] = 0
    rooms[roomID]['veto'] = 0
}


var policyTiles = ["Liberal", "Liberal", "Liberal", "Liberal", "Liberal", "Liberal", 
"Fascist", "Fascist", "Fascist", "Fascist", "Fascist", "Fascist", "Fascist", "Fascist", "Fascist", "Fascist", "Fascist", 
]

function drawCards(roomID, amount){
    // Reset deck if not enough cards
    if (rooms[roomID]['cards'].length < amount){
        rooms[roomID]['cards'] = policyTiles.slice();
    }
    // Drawing hand
    var hand = []
    while (hand.length < amount){
        var randomTile = rooms[roomID]['cards'][Math.floor(Math.random() * rooms[roomID]['cards'].length)];
        hand.push(randomTile);
        rooms[roomID]['cards'].indexOf(randomTile) !== -1 && rooms[roomID]['cards'].splice(rooms[roomID]['cards'].indexOf(randomTile), 1);
    }    
    return hand
}

// TODO
// 11. Did fascist board get full?
//     1. Yes end game
//     2. No check for executive power
//     3. Enact executive power


http.listen(3000, function () {
    console.log('Server started!');
});
