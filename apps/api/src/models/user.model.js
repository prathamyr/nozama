import mongoose from 'mongoose';
import { Product } from './product.model.js'

const AddressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
}, { _id: false });

const CardSchema = new mongoose.Schema({
  brand: String,        // e.g., 'VISA'
  last4: String,        // '4242'
  expMonth: Number,     // 1..12
  expYear: Number,      // 2027
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }, // store hash, not plaintext
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: { type: [AddressSchema], default: [] },
  cards: { type: [CardSchema], default: [] },
  cart: { type: [Product], default: [] }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
