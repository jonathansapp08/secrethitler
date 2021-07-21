<template>
    <div id="container">
        <div id="output">
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

            var elem = document.getElementById('output');
            elem.scrollTop = elem.scrollHeight;
        });
    }
}
</script>

<style scoped>
    h1 {
        text-align: center;        
    }

    #container{
        height:100%;
        position: relative;
        text-align: left;
        display: flex;
        flex-direction: column;
        margin-left: 1vw;
        margin-right: 1vw;
    }

    #output{
        height: 95%;
        overflow-y: scroll;
        word-break: break-word;
    }

    /* ::-webkit-scrollbar {
    background-color: transparent;
    } */

    #input{
        width:100%;
        position: sticky;
        bottom: 0;
    }
    input[type=text] {
        width:80%;
        border: 2px solid black;
        background-color: white;
        color: black;
        padding-left: 1em;
    }
    input[type=submit]{
        width:20%;
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
</style>