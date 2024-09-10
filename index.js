const express = require('express')
const app = express()
const path = require('path')
const http = require('http')

// Create a new socketio server
const socketio = require('socket.io')
const server = http.createServer(app)
const io = socketio(server)

io.on("connection", function (socket) {
    socket.on("send-location", function (data) {
        io.emit("receive-location", { id: socket.id, ...data })
    })

    socket.on("disconnect", function () {
        io.emit("user-disconnect", { id: socket.id })
    })
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')))


app.get("/", (req, res) => {
    res.render("index")
})

server.listen(3000)