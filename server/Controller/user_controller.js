import { response } from "express";
import user_model from "../Models/user_model.js";
import Order from "../Models/Order.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const SECRET_KEY="MERNECOM"
export const adduser = async(req,res)=>{
    try {
        const {uname,uemail,upassword}=req.body
        const checkemail = await user_model.findOne({email:uemail})
        if (checkemail) {
            console.log('email already Existed')
            return res.status(409).json({success:true,message:"email is already register"})
            
        } else {
            const hashpassword = await bcrypt.hash(upassword,10)
                const newuser = new user_model({
            name:uname,
            email:uemail,
            password:hashpassword
        })
        await newuser.save()
        console.log("user added",newuser)
        res.json({success:true,message:'useradded',newuser})
        }
    
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"server error",error})
    }
}
export const Login = async(req,res)=>{
    try {
        const {uemail,upassword}=req.body
        if (typeof uemail !== 'string' || typeof upassword !== 'string' || !uemail.trim() || !upassword) {
            return res.status(400).json({message:'Email and password are required'})
        }

        const user = await user_model.findOne({email:uemail.trim().toLowerCase()})
        if (!user) {
           return res.status(400).json({message:"email not found"})
        } else {
            const checkpassword =await bcrypt.compare(upassword,user.password)
           if (!checkpassword) {
            return res.status(400).json({message:"password not found"})
            
           } else {
            const token=jwt.sign({id:user._id},SECRET_KEY)
             res.status(200).json({message:"login successfully",token})
           }
           
            
        }
    } catch (error) {
       console.error('User login failed:', error)
       res.status(500).json({message:'server error'}) 
    }
}
// View own customer profile
export const getuser = async (req, res) => {
try {
  const {uid} = req.params
  const single_user = await user_model.findById(uid)
  console.log("fletched by id ",single_user)
  res.status(200).json({message:'user found',single_user})
} catch (error) {
  console.log(error)
    res.status(500).json({message:'Server Error',error})

}

}

// Update own profile

export const uploadprofileimage = async (req, res) => {
  try {
    const { uid } = req.params

   console.log('Uploaded file:', req.file)
console.log('User ID:', req.params.uid)

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image'
      })
    }

    const updateprofile = await user_model.findByIdAndUpdate(
      uid,
      { profileimage: req.file.filename },
      { new: true }
    )

    console.log('Updated profile:', updateprofile?.profileimage)

    if (!updateprofile) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      updateprofile
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    })
  }
}

export const Deleteuser =async(req,res)=>{
    try {
        // const user_id =req.params.uid
        const {uid} = req.params
        console.log("delete id",uid)
        const duser =await user_model.findByIdAndDelete(uid)
        console.log("user deleted",duser)
        res.status(200).json({message:"user deleted successfully",duser})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"server error",error})
    }
}



export const viewuser = async (req, res) => {
  try {

    const allusers = await user_model.find().select('-password').lean()

    const userIds = allusers.map(user => user._id)

    // Get order count and total spent for every customer
    const orderStats = await Order.aggregate([
      {
        $match: {
          customer: { $in: userIds }
        }
      },
      {
        $group: {
          _id: '$customer',

          totalOrders: {
            $sum: 1
          },

          totalSpent: {
            $sum: {
              $cond: [
                {
                  $in: ['$orderStatus', ['Cancelled', 'Returned']]
                },
                0,
                { $ifNull: ['$totalAmount', 0] }
              ]
            }
          }
        }
      }
    ])

    // Attach order details to each customer
    const alluserswithorders = allusers.map(user => {

      const orderdata = orderStats.find(
        order => order._id.toString() === user._id.toString()
      )

      return {
        ...user,
        totalOrders: orderdata?.totalOrders || 0,
        totalSpent: orderdata?.totalSpent || 0
      }
    })

    console.log('Customer data:', alluserswithorders)

    res.status(200).json({
      message: 'Fetched all users successfully',
      allusers: alluserswithorders
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: 'Server Error',
      error: error.message
    })
  }
}


export const updateuserstatus = async (req, res) => {
  try {
    const { uid } = req.params
    const { status } = req.body

    if (!["Active", "Inactive", "Blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer status"
      })
    }

    const updateuser = await user_model.findByIdAndUpdate(
      uid,
      { status: status },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updateuser) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Customer status updated successfully",
      updateuser
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    })
  }
}


export const updateprofile = async (req, res) => {
    try {
        const { uid } = req.params
        const { uname, uemail } = req.body

        const updateuser = await user_model.findByIdAndUpdate(
            uid,
            {
                name: uname,
                email: uemail
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password')

        if (!updateuser) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            updateuser
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        })
    }
}
