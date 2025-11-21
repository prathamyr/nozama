import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required:true, index:true},
    slug: {type:String, required: true, unique:true, lowercase:true}, //url friendly
    category: { type: String, required: true, index:true},
    brand: { type: String, required: true, index:true },
    description: {type: String, index:true},
    price: { type: Number, required: true},

    // spec map will be key value pairs to
    // store specs for different categories of products
    specs: {type: Map, of:String},

    thumbnailImg: { type: String, required: true },

    // just in case video hosting is possible;
    imageGallery: [{
    url: String,
    type: { type: String, enum: ['image', 'video'], default: 'image' }
    }],
    
    stockQuantity: { type: Number, required: true, min: 0},
    lowStockThreshold: {type: Number, default: 5},

    //cached - might have to make a review model later
    //constrained
    averageRating: {type: Number, default:0, min:0, max:5},
    reviewCount: {type:Number, default:0},

    //product boolean for admin view
    isActive: {type: Boolean, default: true},
}, {timestamps:true});

// TEXT INDEX (borrowed from geeksforgeeks)
// This allows you to "Search product by keyword"
ProductSchema.index({ name: 'text', description: 'text', brand: 'text' });

export default mongoose.model('Product', ProductSchema);