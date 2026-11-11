import mongoose from "mongoose";

const  categorySchema = new mongoose.Schema(
    {
        name:{type:String,required:true,unique:true,trim:true },
        description:{type:String},
        image:{
            type:String,required:false
        },
       status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
    },
    {timestamps:true}
)
export default mongoose.model('Category',categorySchema);