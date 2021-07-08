<template>
<!-- <div class="columns ml-3 mr-3 mt-3">
  <div class="column">
    First column
  </div>
  <div class="column">
    Second column
  </div>
  <div class="column">
    Third column
  </div>
  <div class="column">
    Fourth column
  </div>
    <div class="column">
    Fourth column
  </div>
</div> -->

<!-- <div class="columns m-3">
  <div class="column">
    First column
  </div>
  <div class="column">
    Second column
  </div>
  <div class="column">
    Third column
  </div>
  <div class="column">
    Fourth column
  </div>
    <div class="column">
    Fourth column
  </div>
</div> -->
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
import io from 'socket.io-client';
let socket = io('http://localhost:3000');

export default {
    name: 'Board',
    data() {
        return{
            waiting: true,
            host: false,
            start: false,
            board: false,
            message: "Message not Working"

        }
    },
    created () {
      socket.on('ishost', (host) => {
        if (host){
          this.host = true;
        }
      });



      socket.on('beginGame', () => {
        this.waiting = false;
        this.start = false;
        this.board = true;
        console.log('hi');
      });

      socket.on('playerCount', (playerCount) => {
        if (playerCount < 2){
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
    },
    methods: {


      hostStart(){
        console.log("hi");
        socket.emit('hostStart', true);
      }
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