import express from 'express'
import dbconnection from './Database/database.js'
import cors from 'cors'
import uRoute from './Routes/user_route.js'
import aRoute from './Routes/admin_routes.js'
import pRoute from './Routes/product_routes.js'
import PRoute from './Routes/payment_routes.js'
import order_routes from './Routes/order_routes.js'
import reviewRoute from './Routes/review_routes.js'
import cRoute from './Routes/cart_route.js'
import CRoute from './Routes/category_routes.js'
import contactRoute from './Routes/contactRoutes.js'
import notificationRoute from './Routes/notificationRoute.js'
import dotenv from 'dotenv'

import http from 'http'
import { Server } from 'socket.io'
import { setIO } from './socket.js'

dotenv.config()

const app = express()

const PORT_NUMBER = process.env.PORT || process.env.PORT_NUMBER || 7002

app.use(cors())
app.use(express.json())

app.use('/User', uRoute)
app.use('/admin', aRoute)
app.use('/product', pRoute)
app.use('/payment', PRoute)
app.use('/review', reviewRoute)
app.use('/cart', cRoute)
app.use('/category', CRoute)
app.use('/order', order_routes)
app.use('/api/contact', contactRoute)
app.use('/notification', notificationRoute)
app.use('/image', express.static('./Upload'))

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ['https://e-commerce-73ti.vercel.app', 'https://e-commerce-one-pied-73.vercel.app'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
})

setIO(io)

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.join('admin')

    console.log(
        'Admin room sockets:',
        io.sockets.adapter.rooms.get('admin')?.size || 0
    )

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
    })
})

const startServer = async () => {
    try {
        await dbconnection()

        server.listen(PORT_NUMBER, () => {
            console.log(`Server is running on port number : ${PORT_NUMBER}`)
        })
    } catch (error) {
        console.log('Database connection failed:', error)
    }
}

startServer()