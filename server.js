const http = require('http')
const express = require("express")
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const server = http.createServer(app)
const connectDB = require('./config/db')
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const musicSessionRoutes = require("./routes/musicSessionRoutes")
const messageRoutes = require("./routes/messageRoutes")
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const morgan = require('morgan');

app.use(morgan('dev'))
app.use(cors())
app.use(express.json()) //for the server to accept JSON data
dotenv.config({ path:'.env'})

//connecting database
connectDB()

/**getting routes */
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes)
app.use('/api/session', musicSessionRoutes);

/**Handle error */
// app.use(notFound)
// app.use(errorHandler)

 
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.NODE_ENV === 'production'? process.env.PRODUCTION_URL : process.env.DEV_SERVER
const service = server.listen( PORT, ()=> {
    console.log(`Server started on port ${PORT}`)
})

const io = require('socket.io')(service, {
    pingTimeout: 60000,
    cors: {
        origin: FRONTEND_URL,
    }
})

io.on('connection', (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData)=> {
        socket.join(userData._id);
        socket.emit('connected')
    })

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('user joined room: '+ room)
    })

    socket.on('typing', (room) => socket.in(room).emit("typing"));
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));


    socket.on('new message', (newMessage) => {
        let chat = newMessage.chat;

        if(!chat.users) return console.log('chat.users not defined');

        chat.users.forEach( user => {
            if(user._id == newMessage.sender._id) return;

            socket.in(user._id).emit('message received', newMessage);
        })
    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
})