<template>
<div>
  <div class="columns">
    <div v-for="(id, username, index) in players" :key="index" class="column">
    <div @click="pick(username)" class="card" style="text-align: center;">
      <div class="card-content">
        <div class="media">
          <div class="media-content"> 
            <p class="title is-4">{{username}}</p>
          </div>
        </div>
      </div>
      <div class="card-image">
        <figure class="image is-128x128 logo">
          <img @click="toggleLogo(username)" :src="getLogo(username)" alt="Placeholder image" style="width: 100%">
        </figure>
      </div>

      <div v-show="showVotes" id="results">
        <img :src="getVote(id)">
      </div>

      <div class="power">
        <img :src="getPresident(id)">
        <img :src="getChancellor(username)">
      </div>

    </div>
    </div>
  </div>

  <div v-show="vote" class="vote">
      <h1>Vote Now</h1>
      <img @click="submitVote('y')" src="../assets/ja.png" alt="">
      <img @click="submitVote('n')" src="../assets/nein.png" alt="">
  </div>

  <div v-show="hand" class="hand">
    <h1>Discard a Policy</h1>
    <div class="cards">
      <div v-for="(card) in cards" :key="card">
        <img @click="discardCard(card)" :src="getPolicy(card)" >
      </div>
    </div>
  </div>

  <div v-show="chancellor" class="hand">
      <h1>Veto?</h1>
      <button @click="vetoChancellor()">Veto</button>
  </div>

  <div v-show="president" class="vote">
      <h1>Veto?</h1>
      <img @click="vetoPresident('y')" src="../assets/ja.png" alt="">
      <img @click="vetoPresident('n')" src="../assets/nein.png" alt="">
  </div>

</div>
</template>

<script>
import socket from '../socket';

export default {
    name: 'App',
    props: ['user'],
    data() {
        return{
            players: [],
            playerLogos: {},
            index: 0,
            logos: ['liberal-logo', 'fascist-logo'],
            currentLogoa: '../assets/liberal-logo.png',
            votes: {},
            showVotes: false,
            vote: false,
            hand: false,
            cards: [],
            chancellor: false,
            president: false,
            showPresident: null,
            showChancellor: null,
            picking: false,
            investigate: false,
            killing: false
        }
    },
    created () {  
      socket.on('listPlayer', (players) => {
        this.players = players;
        for (var player in this.players){
          this.playerLogos[player] = 'liberal-logo'
        }
      });

      socket.on('doneVoting', (votes) => {
        this.votes = votes
        this.showVotes = true
        setTimeout(() => this.showVotes = false, 3000)
      });

      // Get president from server
      socket.on('showPresident', (president) => {
        this.showPresident = president; 
      });

      // Get chancellor from server
      socket.on('showChancellor', (chancellor) => {
        this.showChancellor = chancellor; 
      });

      // Show votes to all players
      socket.on('showVote', () => {
        this.vote = true; 
      });

      socket.on('allowPick', () =>{
        this.picking = true
      });

      socket.on('allowKill', () =>{
        this.killing = true
      });

      socket.on('allowInvestigate', () =>{
        this.investigate = true
      });

      socket.on('receiveCards', (cards) =>{
        setTimeout(() => this.hand = true, 3000)
        this.cards = cards
      });

      socket.on('chancellorVeto', () =>{
        this.chancellor = true
      });

      socket.on('presidentVeto', () =>{
        this.president = true
      });

      socket.on('toggleHand', () =>{
        if (this.hand == false){
          this.hand = true;
        }
        else if (this.hand == true){
          this.hand = false;
        }
      });

      socket.on('endGame', () => {
        console.log("Ending Game");
        this.vote=false;
        this.hand=false;
        this.cards=[];
        this.chancellor=false;
        this.president=false;
        this.picking=false;
      });
    },
    methods: {
      getPolicy(card) {
        return require ('../assets/' + card + '.png');
      },

      getLogo(username) {
        return require('../assets/' + this.playerLogos[username] + '.png')
      },
      
      toggleLogo(username) {
        this.index +=1 ;
        this.playerLogos[username] = this.logos[this.index % 2]
        return require ('../assets/' + this.playerLogos[username] + '.png');
        },

      pick(username){
        if (this.investigate == true && username != this.user) {
          this.investigate = false;
          socket.emit('investigatePlayer', username);
        }
        else if (this.killing == true && username != this.user) {
          socket.emit('killPlayer', username);
          this.killing = false;
        }
        else if (this.picking == true && username != this.user){
          socket.emit('receivePick', username);
          this.picking = false;
        }
        else {
          console.log("Not time to pick and/or you can't pick yourself!");
        }
      },
      
      submitVote(vote){
        socket.emit('receiveVote', vote);
        this.vote = false;
      },

      getVote(id){        
        if (this.votes[id] == 'y'){
          return require ('../assets/ja.png');
        }
        else if (this.votes[id] == 'n'){
          return require ('../assets/nein.png');
        }
      },

      getPresident(id){   
        if (id == this.showPresident){
          return require ('../assets/president-token.png');
        }
        else{
          console.log('no power')
        }
      },

      getChancellor(username){   
        if (username == this.showChancellor){
          return require ('../assets/chancellor-token.png');
        }
        else{
          console.log('no power')
        }
      },

      discardCard(card){
        console.log("Cards before discard " + this.cards);

        if (this.cards.length == 2){
          const index = this.cards.indexOf(card);
          if (index > -1) {
            this.cards.splice(index, 1);
          }
          console.log("Discarding " + card);
          socket.emit('playCard', this.cards);
        }
        else if (this.cards.length == 3){
          const index = this.cards.indexOf(card);
          if (index > -1) {
            this.cards.splice(index, 1);
          }
          
          console.log("Discarding " + card);
          socket.emit('passToChancellor', this.cards);
        }
        this.hand = false;
        this.chancellor = false;
        this.president = false;
        this.cards = []
      },

      vetoChancellor(){
        this.chancellor = false;
        this.hand = false;
        socket.emit('addVeto');
      },

      vetoPresident(decision){
        if (decision == 'y') {
          this.cards = [];
          socket.emit('addVeto');
        }
        else if (decision == 'n') {
          socket.emit('failedVeto');
        }
        this.president = false;
      },
    }
}
</script>

<style scoped>
.vote{
  width: 100vw;
  text-align: center;
}

.vote h1{
  font-size: 3vw;
}

.vote img{
  padding-left: .5vw;
  padding-right: .5vw; 
}





.hand{
  width: 100vw;
  text-align: center;
  display: grid;
  justify-content: space-evenly;
}

.hand h1{
  font-size: 2vw;
}

.hand img{
  padding-left: .5vw;
  padding-right: .5vw; 
}

.cards{
  display: flex;
}

.card{
  padding-bottom: 2vh;
}

.logo{
  margin-left: auto;
  margin-right: auto;
}


.president{
  font-size: 2vw;
}

</style>