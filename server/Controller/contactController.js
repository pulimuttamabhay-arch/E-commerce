import Contact from '../Models/Contact.js'
import transporter from '../config/mailer.js'

export const createContact = async (req, res) => {
    try {
        console.log('Contact API called')

        const { name, email, subject, message } = req.body

        if (!name?.trim() || !email?.trim() ||
            !subject?.trim() || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        console.log('Saving contact...')

        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        })

        console.log('Contact saved successfully')

        console.log('Sending email...')

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

        console.log('Email sent successfully')

        return res.status(201).json({
            success: true,
            emailSent: true,
            message: 'Your message has been sent successfully'
        })
    } catch (error) {
        console.log('Contact form error:', error)

        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to send your message'
        })
    }
}
