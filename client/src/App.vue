<template>
<div id="app">

<div class="columns" style="margin-bottom: 0px; display: contents;">
  <div class="column is-two-thirds" style="padding-top: 0px; padding-bottom: 0px;">
    <div class="Board">
      <Board />
    </div>
    <div class="player">
      <Player />
    </div>
  </div>

  <div id="border" />

  <div class="column is-one-third">
    <div id="chat">
      <Chat />
    </div>
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

<style>
    #app {
        width: 100%;
        font-family: 'Trebuchet MS';
        text-align: left;
        background-color: black;
        color: cyan;
        display: flex;
        position: fixed;
    }
    .Board {
        height: 50vh;
        word-break: break-word;

        border: 1px solid red;
    }
    .player {
        height: 50vh;
        word-break: break-word;

        border: 1px solid blue;
    }
    #chat {
        /* width: 25vw; */
        height: 100vh;
        overflow-y: auto;
        word-break: break-word;
    }
    #border {
        border-right: 2px solid cyan;
    }
    @media (max-width: 1000px) {
        #app {
            flex-direction: column;
        }
        #Board {
            /* width: 100vw; */
            height: 50vh;
        }
        #input {
            /* width: 100vw; */
            height: 50vh;
        }
    }
</style>