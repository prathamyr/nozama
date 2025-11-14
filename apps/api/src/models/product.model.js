import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    img: { type: String, required: true },
    quantity: { type: Number }
});

export default mongoose.model('Product', ProductSchema);