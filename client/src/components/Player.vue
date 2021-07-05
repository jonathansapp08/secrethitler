<template>
<div class="columns">

<div v-for="(name, value, index) in players" :key="index" class="column">
<div @click="sayHi()" class="card" style="text-align: center;">
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        
        <p class="title is-4">{{value}}</p>
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
          this.players = players; 
        });
         
    },
    methods: {
       sayHi(){
         console.log("hiiiiiiii")
       }
    }
}
</script>
