
import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    name:{type:String,required:true , default:"unknown"},
    email:{type:String , unique:true, required:true, lowercase:true},
    password:{type:String,required:true},
    phone:{type:String},
    address:{type:String},
    profileimage:{type:String,default:""},
    status:{type:String,enum:["Active","Inactive","Blocked"],default:"Active"}

},{timestamps:true}
)

export default mongoose.model('User',userschema)
