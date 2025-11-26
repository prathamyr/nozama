import mongoose from 'mongoose';
const {Schema} = mongoose;

// HAS TO IMMUTABLE
const orderSchema = new mongoose.Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userEmail: { type: String, required: true, trim: true },

    itemsOrdered: [{
        productId: {type: Schema.Types.ObjectId, ref:'Product', required: true},
        //frozen fields for future reference
        productName: {type: String, required: true},
        productPrice: {type: Number, required: true},
        thumbnailImg: {type: String, required: true},
        quantity: {type: Number, required: true},
    }],

    subtotal: { type: Number, required: true },
    taxPrice: { type: Number, required: true, default: 0.0 }, 
    shippingPrice: { type: Number, required: true, default: 0.0 }, 
    totalAmount: { type: Number, required: true },

    shippingAddress: {
        fullName: {type: String, required: true},
        line1: {type: String, required: true},
        line2: {type: String},
        city: {type: String, required: true},
        state: {type: String, required: true},
        postalCode: {type: String, required: true},
        country: {type: String, required: true},
    },

    billingAddress: {
        fullName: {type: String, required: true},
        line1: {type: String, required: true},
        line2: {type: String},
        city: {type: String, required: true},
        state: {type: String, required: true},
        postalCode: {type: String, required: true},
        country: {type: String, required: true},
    },

    billingInfo: {
        lastFourDigits: {type: String, required: true},
        cardBrand:{type: String, required: true},
    },     

    orderStatus: {
        type: String, 
        enum:["pending", "paid", "processing", "shipped", "delivered", "cancelled", "failed"],
        default: "pending",
    },

    //for dummy
    paymentDetails: {
        transactionId: { type: String }, // e.g. "TXN_123456789"
        paymentStatus: { 
            type: String, 
            enum: ["Approved", "Declined", "Pending", "Refunded", "Failed"] }, 
        paymentDate: { type: Date },
    },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

