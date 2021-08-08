<template>
<div>
  <div v-show="board" class="board">
    <img :src="getFascistCount()" alt="Fascist Board" style="max-width: 50vw; height: 23vh;">
    <img :src="getLiberalCount()" alt="Liberal Board" style="max-width: 50vw; height: 23vh;">
    <img @mouseover="policyCount()" src="../assets/policy.png" alt="Policy Pile" class="policy">
  </div>

  <div v-show="waiting" class="waiting messages">
    <p>{{message}}</p>
    <button v-show="start" @click="hostStart()">Start Game</button>
  </div>

  <div v-show="restart" class="restart messages">
    <button v-show="restart" @click="hostRestart()">Restart Game</button>
  </div>





  
  <!-- <div class="columns">
     <div class="column">
      <div v-show="board" class="board">
        <img :src="getFascistCount()" alt="Fascist Board" style="max-width: 50vw; height: 23vh;">
        <img :src="getLiberalCount()" alt="Liberal Board" style="max-width: 50vw; height: 23vh;">
      </div>
    </div>
    <div class="column messages">
      <div v-show="waiting" class="waiting">
        <p>{{message}}</p>
        <button v-show="start" @click="hostStart()">Start Game</button>
      </div>

      <div v-show="restart" class="restart">
        <button v-show="restart" @click="hostRestart()">Restart Game</button>
      </div>
      <div v-show="board">
        <img @mouseover="policyCount()" src="../assets/policy.png" alt="Policy Pile">
      </div>
    </div>
  </div> -->
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
            restart: false,
            board: false,
            message: "Waiting for more players",
            liberal: 0,
            fascist: 0,
            count: null,
            powers: null
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
        if (Object.keys(playerCount).length < 1){
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

      socket.on('addLiberal', (liberalCount) => {
        this.liberal = liberalCount;
        if (this.liberal == 5){
          this.waiting = false;
          this.start = false;
          this.board = true;
          this.restart = true;
        }
      });

      socket.on('addFascist', (fascistCount) => {
        this.fascist = fascistCount;
        if (this.fascist == 6){
          this.waiting = false;
          this.start = false;
          this.board = true;
          this.restart = true;
        }
      });

      socket.on('restartGame', () => {
        this.message=null;
        this.restart=true;
      });

      socket.on('hideRestart', () => {
        this.restart=false;
      });

      socket.on('generatePowers', (powers) => {
        this.powers=powers;
      });

    },
    methods: {
      hostStart(){
        console.log("Beginning Game!");
        socket.emit('hostStart', this.players);
      },
      hostRestart(){
        console.log("Restarting Game!");
        this.restart=false;
        this.liberal=0;
        this.fascist=0;
        socket.emit('hostStart', this.players);
      },
      policyCount(){
        this.count = socket.emit('getPolicyCount');
      },
      getLiberalCount() {
        return require('../assets/liberal-board/liberalboard' + this.liberal + '.png')
      },
      getFascistCount() {
        var players = this.players;
        var board = null;
        if (players > 8){
          board = 9
          return require('../assets/fascist-board/fascistboard' + board + '-' + this.fascist + '.png')
        }
        else if (players > 6){
          board = 7
          return require('../assets/fascist-board/fascistboard' + board + '-' + this.fascist + '.png')
        }
        else {
          board = 5
          return require('../assets/fascist-board/fascistboard' + board + '-' + this.fascist + '.png')
        }
      },
    }
}
</script>

<style scoped>
.messages{
    font-size: 2.5vw;
  }

@media only screen and (max-width: 1542px) {
  .policy {
    display: none;
  }
}

</style>