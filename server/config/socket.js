import { Server } from 'socket.io'

export let io

export const initializeSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    })

    io.on('connection', (socket) => {

        console.log('Admin connected:', socket.id)

        socket.on('disconnect', () => {
            console.log('Admin disconnected:', socket.id)
        })

    })

    return io
}