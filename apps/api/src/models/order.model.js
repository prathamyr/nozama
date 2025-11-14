import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    user_email: { type: String, requried: true, trim: true },
    items_ordered: { type: [{ String: Number }], default: [{}]} // store an array of {product name : product quantity} objects
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);

