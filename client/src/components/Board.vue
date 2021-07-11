<template>
<div>
  <div v-show="waiting" class="waiting">
    <p>{{message}}</p>
    <button v-show="start" @click="hostStart()">Start Game</button>
  </div>

  <div v-show="board" class="board">
    <img src="../assets/liberalboard.png" alt="Girl in a jacket" width="470" height="600">
    <img src="../assets/fascistboard78.png" alt="Girl in a jacket" width="470" height="600">

    <img src="../assets/policy.png" alt="Girl in a jacket" width="75" height="600">
  </div>
</div>

</template>
<script>
import socket from '../socket';

export default {
    name: 'Board',
    data() {
        return{
            waiting: true,
            host: false,
            players: null,
            start: false,
            board: false,
            message: "Waiting for more players"
        }
    },
    created () {
      socket.on('ishost', (host) => {
        if (host){
          this.host = true;
          console.log("You are a host")
        }
      });

      socket.on('playerCount', (playerCount) => {
        this.players = playerCount;
        if (Object.keys(playerCount).length < 2){
          this.message = "Waiting for more players";
        }
        else if (this.host == true){
          this.message = "Ready to go!";
          this.start = true;
        }
        else{
          this.message = "Wait for host to start";
        }
      });
      
      socket.on('showBoard', () => {
        this.waiting = false;
        this.start = false;
        this.board = true;
      });

    },
    methods: {
      hostStart(){
        console.log("Beginning Game!");
        socket.emit('hostStart', this.playersm);
      },
    }
}
</script>

<style scoped>
.columns{
  height: 45%;
}

.column{
  border: 3px solid black;
}
</style>