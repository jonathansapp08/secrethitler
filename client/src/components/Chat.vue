<template>
    <div id="container">
        <div id="output">
            <!-- <h1>Messages</h1> -->
            <p v-for="(text, index) in textOutput" :key="index">{{text}}</p>
        </div>
        <div id="input">
            <form>
                <input type="text" v-model="textInput" :placeholder="textInput" />
                <input type="submit" value="Send" v-on:click="submitText" />
            </form>
        </div>
    </div>
</template>

<script>
import socket from '../socket';

export default {
    name: 'Chat',
    props: ['username'],
    data() {
        return {
            textInput: null,
            textOutput: []
        }
    },
    methods: {
        submitText: function (event) {
            event.preventDefault();
            if (this.textInput != null){
                socket.emit('send_message', this.username, this.textInput);
            }
        }
    },
    created: function () {
        socket.on('receive', (text) => {
            this.textOutput.push(text);
            this.textInput = null;
        });
    }
}
</script>

<style scoped>
    #container {
        text-align: left;
        display: flex;
        flex-direction: column;
        margin-left: 1vw;

    }
    h1 {
        text-align: center;        
    }

    #input {
        position: fixed;
        margin-top: 40vh;
    }
    input[type=text] {
        height: 20px;
        width:  25vw;
        padding: 11px;
        border: 2px solid black;
        background-color: white;
        color: black;
        padding-left: 1em;
    }
    input[type=submit]{
        height: 25px;
        width: 5vw;
        background-color: #608cb3;
        color: black;
        border: 1px solid black;
    }
    input[type=submit]:focus{
        outline: none;
    }
    input[type=submit]:hover{
        background-color: #e36247;
    }

    @media (max-width: 1000px) {
        #input {
            margin-top: 43vh;
        }
        #output {
            margin-right: 10vw;
        }
        input[type=text] {
            width: 20vw;
        }
        input[type=submit] {
            min-width: 10vw;
        }
    }
</style>