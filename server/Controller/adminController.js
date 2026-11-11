import Admin from '../Models/Admin_model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY='MERNECOM'
// Admin registration (initial setup only)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(409).json({
        message: 'Admin already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        password :admin.password
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin log
export const adminlogin = async (req,res)=>{
  try {
    const {email,password}=req.body
    const admin = await Admin.findOne({email})
    if (!admin) {
      res.status(400).json({success:false,message:"email not found"})
    } else {
      const checkpassword = await bcrypt.compare(password,admin.password)
      if(!checkpassword){
        res.json({success:false,message:"password not founded"})
      }else{
        const token = await jwt.sign({id:admin._id},SECRET_KEY)
        res.status(200).json({message:"admin logged in successfully",token})
      }
    }
  } catch (error) {
    console.error('Admin login failed:', error)
    res.status(500).json({message:'server error'})
  }
}
