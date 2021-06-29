<template>
<div id="app">

<div class="columns top-half" style="margin-top: 0px;">
  <div class="column is-two-thirds">
    <Board />
  </div>
  <div id="chat" class="column">
    <Chat />
  </div>
</div>

<div class="columns">
  <div class="column">
    <Player/>
  </div>
</div>

</div>
</template>

<script>
    import Board from './components/Board.vue';
    import Player from './components/Player.vue';
    import Chat from './components/Chat.vue';

    export default {
        name: 'App',
        components: {
            Board,
            Player,
            Chat
        }
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