import mongoose from 'mongoose';
const {Schema} = mongoose;


// cart status includes abandoned for future use; current logic only includes 'open', 'converted' for payment mocks;
// have to ensure inside service -> either/or for user/guest.
const cartSchema = new mongoose.Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    guestSessionId: {type:String},
    coupon: {type: String},
    status: {type:String, enum:["open", "converted", "abandoned"], default:"open"},

    items: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, 
            quantity: { type: Number, required: true, min:1, default: 1},
            //can cache price here;
        }
    ],

},{ timestamps: true });

