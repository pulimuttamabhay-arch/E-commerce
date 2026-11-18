import express from 'express'
import mongoose from 'mongoose'
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
import cloudinary from './config/cloudinary.js'

dotenv.config()

const app = express()

const PORT_NUMBER = process.env.PORT || process.env.PORT_NUMBER || 7002
const allowedOrigins = [
    'https://e-commerce-73ti.vercel.app',
    'https://e-commerce-one-pied-73.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    /^https:\/\/e-commerce-[a-z0-9-]+-project-99bd\.vercel\.app$/
]
const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(express.json())

app.get('/health', (req, res) => {
    const connected = mongoose.connection.readyState === 1

    res.status(connected ? 200 : 503).json({
        status: connected ? 'ok' : 'database unavailable'
    })
})

app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database unavailable'
        })
    }

    return next()
})

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
app.use('/image', (req, res) => {
    let publicId

    try {
        publicId = decodeURIComponent(req.path.slice(1))
    } catch {
        return res.status(400).json({ message: 'Invalid image path' })
    }

    if (!publicId || publicId.includes('..')) {
        return res.status(400).json({ message: 'Invalid image path' })
    }

    if (/^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\//i.test(publicId)) {
        return res.redirect(publicId)
    }

    const cloudinaryPublicId = publicId.startsWith('Uploads/')
        ? publicId
        : `Uploads/${publicId}`

    try {
        return res.redirect(cloudinary.url(cloudinaryPublicId, {
            secure: true,
            resource_type: 'image'
        }))
    } catch (error) {
        console.error('Image redirect failed:', error.message)
        return res.status(404).json({ message: 'Image not found' })
    }
})

const server = http.createServer(app)

const io = new Server(server, {
    cors: corsOptions
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
    await dbconnection()

    server.listen(PORT_NUMBER, () => {
        console.log(`Server is running on port number : ${PORT_NUMBER}`)
    })
}

startServer().catch((error) => {
    console.error('Application startup failed:', error)
    process.exitCode = 1
})