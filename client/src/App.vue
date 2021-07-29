<template>
<div id="app">

<div v-show="lobby" class="lobby">

    <img src="./assets/banner.png" alt="Banner" class="banner">

    <div class="newRoom">
        <h4>Create a new game</h4>
        <form onsubmit="return false">                        
            <input v-model="username" type="text" placeholder="Enter Username">
            <!-- <input v-model="playerNum" type="number" placeholder="Enter number of players"> -->
            <button @click="createGame(username)">Create</button>
        </form>
    </div>
    
    <div class="joinRoom">
        <h4>Or join an existing game</h4>
        <form onsubmit="return false">                        
            <input v-model="username" type="text" placeholder="Enter Username">
            <input v-model="roomID" type="text" placeholder="room ID here">
            <button @click="joinGame(username, roomID)">Join</button>
        </form>
    </div>

</div>

<div v-show="game" class="game">
    <div class="columns top-half" style="margin-top: 0px;">
    <div class="column is-one-half">
        <Board />
    </div>
    <div id="chat" class="column">
        <Chat :username="username" />
    </div>
    </div>

    <div class="columns">
    <div class="column">
        <Player :user="username" />
    </div>
    </div>
</div>

</div>
</template>

<script>
import Board from './components/Board.vue';
import Player from './components/Player.vue';
import Chat from './components/Chat.vue';

import socket from '../src/socket';

export default {
    name: 'App',
    components: {
        Board,
        Player,
        Chat
    },
    data() {
        return{
            lobby: true,
            game: false,
            username: null,
            roomID: null,
            admin: false
        }
    },
    created () {  
        socket.on('newGame', (roomID) => {
            this.roomID = roomID;
        });
    },
    methods: {
        createGame (username) {
            if (username != null){
                socket.emit('createGame',{username:username});
                this.lobby = false
                this.game = true
                this.username = username
                this.admin = true
            }
        },
        joinGame (username, roomID) {
            if (username != null && roomID != null){
                socket.emit('joinGame',{username:username, roomID:roomID});
                this.lobby = false
                this.game = true
                this.username = username
                this.roomID = roomID
            }
        }
    }
}
</script>

<style scoped>
#app {
    background-color: #FBB969;
    color: black;
    font-family: 'Trebuchet MS';
} 

.columns{
    height: 50vh;
}

.column{
    border: 2px solid black;
}

#chat {
    /* overflow-y: auto;
    word-break: break-word; */
}









.lobby{
    height: 100vh;
    background-color: #f2654b;

    
    font-size: 2.5vw;
    font-family: Arial;
    color: white;
}

.banner{
    width: 50%;
    display: block;
    margin-left: auto;
    margin-right: auto;
}

</style>