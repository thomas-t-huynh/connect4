const path = require("path");
const http = require('http');
const express = require('express')
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage } = require('./utils/messages')
const app = express();

const server = http.createServer(app)

// socketio expects a raw http server (express isn't considered one).
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('new web socket connection');
    socket.emit('message', generateMessage('Welcome!') )
    //broadcast emits to everyone, but the person who just joined
    socket.broadcast.emit('message', generateMessage('a new user has joined!') ) 

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        const cleanMessage = filter.clean(message)
        io.emit('message', generateMessage(cleanMessage))

        callback('message delivered');
    })

    socket.on('sendLocation', (coords, callback) => {
        const { latitude, longitude } = coords
        callback('location is shared')
        io.emit('locationMessage', `https://google.com/maps?q=${latitude},${longitude}`)
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left'))
    })
})



server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})