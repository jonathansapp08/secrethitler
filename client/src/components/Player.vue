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
            picking: false
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
      
    }
}
</script>
