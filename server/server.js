import { Server } from "socket.io";

const io = new Server(6300)

const emailToSocketMap = new Map()
const socketToEmailMap = new Map()

io.on('connection', socket => {
    console.log(socket.id)
    socket.on('join room', data => {
        const { email, room } = data
        emailToSocketMap.set(email, socket.id)
        socketToEmailMap.set(socket.id, email)
        io.to(room).emit('user joined', {
            email,
            id: socket.id
        })
        socket.join(room)
        io.to(socket.id).emit('join room', data)
    })
    socket.on('call user', ({ to, offer }) => {
        io.to(to).emit('incoming call', {
            from: socket.id,
            offer
        })
    })
    socket.on('call accepted', ({ to, answer }) => {
        io.to(to).emit('call accepted', {
            from: socket.id,
            answer
        })
    })
    socket.on('negotiation needed', ({ to, offer }) => {
        io.to(to).emit('negotiation needed', {
            from: socket.id,
            offer
        })
    })
    socket.on('negotiation done', ({ to, answer }) => {
        io.to(to).emit('negotiation final', {
            from: socket.id,
            answer
        })
    })
})