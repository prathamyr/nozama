import mongoose from 'mongoose';
const {Schema} = mongoose;

const inventoryLogSchema = new mongoose.Schema({
    productId: {type:Schema.Types.ObjectId, ref: 'Product', required: true, index: true},
    adminId: {type:Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    
    // helps you filter history later or drop down too in form view;
    actionType: {
        type: String,
        enum: ['RESTOCK', 'SALE', 'CORRECTION', 'CANCELLED_ORDER'],
        required: true,
    },

    quantityChange: {type: Number, required: true}, // can be negative
    reason: {type: String},
}, {timestamps:true});

export default mongoose.model('InventoryLog', inventoryLogSchema);
