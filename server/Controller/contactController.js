import Contact from '../Models/Contact.js'
import transporter from '../config/mailer.js'

export const createContact = async (req, res) => {
    const { name, email, subject, message } = req.body || {}

    if (![name, email, subject, message].every(
        (value) => typeof value === 'string' && value.trim()
    )) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        })
    }

    let contact
    try {
        contact = await Contact.create({ name, email, subject, message })
    } catch (error) {
        console.error('Contact save failed:', error.message)
        return res.status(error.name === 'ValidationError' ? 400 : 500).json({
            success: false,
            message: error.name === 'ValidationError'
                ? 'Please provide a valid email address and message.'
                : 'Unable to save your message.'
        })
    }

    let emailSent = false
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.ADMIN_EMAIL,
            replyTo: contact.email,
            subject: `New Contact Message: ${contact.subject}`,
            text: `
Name: ${contact.name}
Email: ${contact.email}
Subject: ${contact.subject}

Message:
${contact.message}
            `
        })
        emailSent = true
    } catch (error) {
        console.error('Contact notification email failed:', error.message)
    }

    return res.status(201).json({
        success: true,
        emailSent,
        message: emailSent
            ? 'Your message has been sent successfully'
            : 'Your message was received, but the notification email could not be sent.'
    })
}
