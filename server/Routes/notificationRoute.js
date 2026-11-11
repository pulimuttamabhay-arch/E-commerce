import express from 'express'

import {
    ViewNotification,
    MarkRead,
    MarkAllRead
} from '../Controller/notificationController.js'

import {verifyToken} from '../Middleware/authMiddleware.js'

const route = express.Router()

route.get('/viewnotifications', verifyToken, ViewNotification)

route.put('/markread/:id', verifyToken, MarkRead)

route.put('/markallread', verifyToken, MarkAllRead)

export default route