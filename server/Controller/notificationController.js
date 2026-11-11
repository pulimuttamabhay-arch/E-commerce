import Notification from '../Models/Notification.js'

// View all notifications
export const ViewNotification = async (req, res) => {
    try {

        const notifications = await Notification.find()
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notifications
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}


// Mark one notification as read
export const MarkRead = async (req, res) => {
    try {

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}


// Mark all notifications as read
export const MarkAllRead = async (req, res) => {
    try {

        await Notification.updateMany(
            { isRead: false },
            { $set: { isRead: true } }
        )

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}
