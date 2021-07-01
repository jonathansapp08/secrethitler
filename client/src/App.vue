<template>
<div id="app">

<div v-show="lobby" class="lobby">

    <div class="newRoom">
        <h4>Create a New Game</h4>
        <form onsubmit="return false">                        
            <input v-model="username" type="text" placeholder="Enter Username">
            <button @click="createGame(username)">Create</button>
        </form>
    </div>
    
    <div class="joinRoom">
        <h4>Join an existing Game</h4>
        <form onsubmit="return false">                        
            <input v-model="username" type="text" placeholder="Enter Username">
            <input v-model="roomID" type="text" placeholder="room ID here">
            <button @click="joinGame(username, roomID)">Join</button>
        </form>
    </div>


</div>


<div v-show="game" class="game">
    <div class="columns top-half" style="margin-top: 0px;">
    <div class="column is-two-thirds">
        <Board />
    </div>
    <div id="chat" class="column">
        <Chat :username="username" />
    </div>
    </div>

    <div class="columns">
    <div class="column">
        <Player/>
    </div>
    </div>
</div>

</div>
</template>

<script>
import Board from './components/Board.vue';
import Player from './components/Player.vue';
import Chat from './components/Chat.vue';

import io from 'socket.io-client';
let socket = io('http://localhost:3000');

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
            roomID: null
        }
    },
    created () {    
        window.addEventListener('beforeunload', this.leaveGame)  
    },
    methods: {
        createGame (username) {
            if (username != null){
                socket.emit("createGame",{username:username});
                this.lobby = false
                this.game = true
                this.username = username
            }
        },
        joinGame (username, roomID) {
            socket.emit("joinGame",{username:username, roomID:roomID});
            this.lobby = false
            this.game = true
            this.username = username
            this.roomID = roomID
        },
        leaveGame () {
            console.log("QUITTING")
            console.log("bye " + this.username)
            console.log(this.roomID)

            if (typeof this.roomID === 'string') {
                console.log('beginning call')
                socket.emit("leaveGame",{username:this.username, roomID:this.roomID});
                console.log('ending call')
            }

            // TODO DISCONNECT AND TELL EVERYONE THAT USER DISCONNECTED

            // this.username = username
            // this.roomID = roomID
            
        }
    },
    beforePageDestroyed: function (username, roomID) {
        socket.disconnect({username:username, roomID:roomID});
    },

    // mounted: function (data) {
    //     alert(data.username)
    //     alert(data.roomID)
    // }

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
    overflow-y: auto;
    word-break: break-word;
}
    
/* .Board {
    height: 50vh;
    width: 50vw;
    word-break: break-word;

    border: 1px solid red;
}

.player {
    height: 50vh;
    word-break: break-word;

    border: 1px solid blue;
}

#border {
    border-right: 2px solid cyan;
}
@media (max-width: 1000px) {
    #app {
        flex-direction: column;
    }
    #Board {
        width: 100vw;
        height: 50vh;
    }
    #input {
        width: 100vw;
        height: 50vh;
    }
} */
</style>