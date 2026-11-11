import jwt from 'jsonwebtoken'
import Admin from '../Models/Admin_model.js'

const SECRET_KEY = 'MERNECOM'

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please login as an admin'
      })
    }

    const decoded = jwt.verify(token, SECRET_KEY)
    const admin = await Admin.findById(decoded.id).select('_id')

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      })
    }

    req.adminId = admin._id
    return next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token'
    })
  }
}
