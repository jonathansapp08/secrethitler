<template>
<div class="columns">

<div v-for="index in players" :key="index" class="column">
<div class="card" style="text-align: center;">
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        
        <!-- TODO DISPLAY ONLY USERNAMES -->
        <p class="title is-4">{{players}}</p>
      </div>
    </div>
  </div>
  <div class="card-image">
    <!-- <figure class="image is-4by3">
      <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
    </figure> -->
  </div>
</div>
</div>

</div>
</template>

<script>
import io from 'socket.io-client';
let socket = io('http://localhost:3000');

export default {
    name: 'App',
    components: {
    },
    data() {
        return{
            players: []
        }
    },
    created () {  
        socket.on('listPlayer', (players) => {
          console.log(players);
          this.players = players; 
        });
         
    },
    methods: {
       
    }
}
</script>
