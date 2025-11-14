import mongoose from 'mongoose';
import { Product } from './product.model.js'

const OrderSchema = new mongoose.Schema({
    user_email: { type: String, requried: true, trim: true },
    items_ordered: { type: [Product], default: [] },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);

