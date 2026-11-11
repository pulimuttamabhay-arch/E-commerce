
import { io } from 'socket.io-client'
import { host } from '../../client/src/Context/Host'

const socket = io(`${host}`, {
    autoConnect: true,
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
})

export default socket
