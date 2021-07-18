<template>
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
    <figure class="image is-128x128">
      <img src="https://bulma.io/images/placeholders/128x128.png" alt="Placeholder image">
    </figure>
  </div>
</div>
</div>

<div v-show="vote" class="vote">
    <button @click="submitVote('y')">Yes</button>
    <button @click="submitVote('n')">No</button>
</div>

<div v-show="hand" v-for="(card) in cards" :key="card" class="hand">
    <button @click="discardCard(card)">{{card}}</button>
</div>

<div v-show="chancellor" class="veto">
    <button @click="vetoChancellor()">Veto</button>
</div>

<div v-show="president" class="veto">
    <button @click="vetoPresident('y')">Yes</button>
    <button @click="vetoPresident('n')">No</button>
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
            vote: false,
            hand: false,
            cards: [],
            chancellor: false,
            president: false,
            picking: false,
            killing: false
        }
    },
    created () {  
      socket.on('listPlayer', (players) => {
        this.players = players; 
      });

      socket.on('showVote', () => {
        this.vote = true; 
      });

      socket.on('allowPick', () =>{
        this.picking = true
      });

      socket.on('allowKill', () =>{
        console.log('Allowing kills');
        this.killing = true
      });

      socket.on('receiveCards', (cards) =>{
        this.hand = true
        this.cards = cards
      });

      socket.on('chancellorVeto', () =>{
        this.chancellor = true
      });

      socket.on('presidentVeto', () =>{
        this.president = true
      });

      socket.on('toggleHand', () =>{
        console.log(this.hand)

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
      pick(username){

        if (this.killing == true) {
          socket.emit('killPlayer', username);
          this.killing == false;
        }

        if (this.picking == true && username != this.user){
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
        console.log(decision);
        if (decision == 'y') {
          socket.emit('addVeto');
        }
        if (decision == 'n') {
          socket.emit('failedVeto');
        }
        this.president = false;
      },
    }
}
</script>
