const express = require('express');
const app = express()
const socket = require('socket.io')
const { Chess } = require('chess.js')
const path = require('path')
const http = require('http')

const server = http.createServer(app);
const io = socket(server)

const chess = new Chess();
let players = {};
let currentPlayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" })
})

io.on("connection", function (uniquesocket) {
    console.log("Connected");
    // uniquesocket.on('churan',function() {
    //    io.emit("churan paapdi")
    // })

    // uniquesocket.on("disconnect",function() {
    //     console.log("disconnect");

    // })

    if (!players.white) {
        players.white = uniquesocket.id
        uniquesocket.emit("playerRole", "w")
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b")
    } else {
        uniquesocket.emit("spectatorRole")
    }
    uniquesocket.on("disconnect", function () {
        if (uniquesocket.id === players.white) {
            delete players.white;

        } else if (uniquesocket.id === players.black) {
            delete players.black
        }
    })

    uniquesocket.on("move", function (move) {
        try {
            if (chess.turn() === 'w' && players.white !== uniquesocket.id)
                return;

            if (chess.turn() === 'b' && players.black !== uniquesocket.id)
                return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen())
            } else {
                console.log("Invalid move", move);
                uniquesocket.emit(" invalid move", move)

            }

        } catch (error) {
            console.log("error", error);
            uniquesocket.emit("Invalid error", error)

        }
    })

})

server.listen(3000, () => {
    console.log("server start at 3000")
})