const mongoose = require('mongoose');
const {Schema} = mongoose;

// added db-level validations for each field;

/*
Reason to update: '_id: false' needed to be removed because addresses need to be edited
*/
const addressSchema = new mongoose.Schema({
  addressType: {
    type: String, 
    enum:['billing', 'shipping', 'both'], 
    default: 'both', 
    required: true
  }, //billing or shipping
  
  fullName: {type: String, required: true},
  line1: {type: String, required: true},
  line2: {type: String},
  city: {type: String, required: true},
  state: {type: String, required: true},
  postalCode: {type: String, required: true},
  country: {type: String, required: true},
}); 

// id's needed to delte specific cards;
const paymentMethodSchema = new mongoose.Schema({
  cardBrand: { type: String },
  last4: { type: String },
  expiryMonth: { type: Number },
  expiryYear: { type: Number },
  label: { type: String },
  isDefault: { type: Boolean, default: false },
});


const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true, trim:true},
  lastname: {type: String, required: true, trim:true},
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }, // store hash, not plaintext

  role: { 
    type: String, 
    enum: ['customer', 'admin'], 
    default: 'customer',
    required: true,
  },

  wishlist: [{
  type: Schema.Types.ObjectId,
  ref: 'Product',
  }],

  shippingAddress: { type: addressSchema },
  billingAddress: { type: addressSchema},

  paymentMethods: paymentMethodSchema,

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
