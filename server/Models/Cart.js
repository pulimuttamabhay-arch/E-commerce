    import mongoose, { mongo } from "mongoose";
    const cartSchema = new mongoose.Schema(
        {
            customer:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'user',
                required:true,
                unique:true
            },
            items:[
                {
                    product:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:'Product',required:true
                    },
                    quantity:{
                        type:Number,
                        required:true,
                        default:1,
                        min:1
                    }
                }
            ]
        },
        {timestamps:true}

    );
    export default mongoose.model('Cart',cartSchema); 