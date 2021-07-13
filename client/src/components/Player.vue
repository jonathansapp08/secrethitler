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
            cards: []
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
        console.log("PICK!!!!")
        this.picking = true
      });

      socket.on('receiveCards', (cards) =>{
        console.log(cards);
        this.hand = true
        this.cards = cards
      });
         
    },
    methods: {
      pick(username){
        if (this.picking == true && username != this.user){
          console.log(username);
          socket.emit('receivePick', username);
          this.picking = false;
        }
        else {
          console.log("Not time to pick and/or you can't pick yourself!");
        }

      },
      
      submitVote(vote){
        console.log(vote);
        socket.emit('receiveVote', vote);
        this.vote = false;
      },

      discardCard(card){
        if (this.cards.length == 2){
          const index = this.cards.indexOf(card);
          if (index > -1) {
            this.cards.splice(index, 1);
          }
          console.log("Discarding " + card);
          socket.emit('playCard', this.cards);
        }

        if (this.cards.length == 3){
          const index = this.cards.indexOf(card);
          if (index > -1) {
            this.cards.splice(index, 1);
          }
          console.log("Discarding " + card);
          socket.emit('passToChancellor', this.cards);
          this.hand = false;
        }
        this.cards = []
      },
    }
}
</script>
