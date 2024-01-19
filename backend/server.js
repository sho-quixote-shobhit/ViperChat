const express = require('express');
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const http = require('http')
const port = process.env.port || 5000
const morgan = require('morgan')
const {notfound , errorhandler} = require('./middlewares/errorMiddleware')

app.use(morgan('dev'))
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.json())

const ConnectToMongo = require('./db')
ConnectToMongo();

const userRoutes = require('./routes/userRoutes')
app.use('/user' , userRoutes)
const chatRoutes = require('./routes/chatRoutes')
app.use('/chat' , chatRoutes)
const messageRoutes = require('./routes/messageRoutes')
app.use('/message' , messageRoutes)



app.use(notfound)
app.use(errorhandler)

const server = app.listen(port , ()=>{
    console.log(`server running at ${port}`)
})

const io = require('socket.io')(server , {
    cors : {
        origin : 'http://localhost:3000 '
    },
    pingTimeout : 60000
})

io.on('connection' , (socket)=>{

    //user opens the application we setup the socket connection
    socket.on('setup' , (userData) => {
        socket.join(userData._id)
        socket.emit('connected')
    })

    socket.on('join chat' , (room) => {
        socket.join(room)
        console.log(`user joined the room ${room}`)
    })

    socket.on('new message' , (newmessageReceived)=>{
        var chat = newmessageReceived.chat
        if(!chat.users) return console.log('chat.users not defined')

        chat.users.forEach(user => {
            if(user._id === newmessageReceived.sender._id) return;
            socket.in(user._id).emit('message received' , newmessageReceived)
        });
    })

    socket.on('typing' , (room)=>{
        socket.in(room).emit('typing' , room)
    })

    socket.on('stop typing' , (room)=>{
        socket.in(room).emit('stop typing' , room)
    })

    socket.off('setup' , (userData)=>{
        console.log('user disconnected')
        socket.leave(userData._id)
    })
})