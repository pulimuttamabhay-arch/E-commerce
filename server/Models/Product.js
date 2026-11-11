
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        mrp: {
            type: Number,
            default: 0,
            min: 0
        },

        stock: {
            type: Number,
            default: 0
        },

        image: {
            type: String, required:false
        },

        images: {
            type: [String],
            default: []
        },

        brand: {
            type: String,
            default: ''
        },

        status: {
            type: String,
            enum: ['Instock', 'Low stock', 'Out of Stock'],
            default: 'Instock'
        },

        featured: {
            type: Boolean,
            default: false
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0
        },

        totalReviews: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        date: {
            type: Date,
            default: Date.now
        }
    }
);

productSchema.index({
    name: 'text',
    description: 'text'
});

export default mongoose.model('Product', productSchema);
