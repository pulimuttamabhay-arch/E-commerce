import jwt from 'jsonwebtoken'

const SECRET_KEY = "MERNECOM"

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      })
    }

    const decoded = jwt.verify(token, SECRET_KEY)

    req.id = decoded.id

    console.log('Logged-in user ID:', req.id)

    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}