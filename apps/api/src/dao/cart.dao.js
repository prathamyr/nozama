const Cart = require('../models/cart.model');

class CartDAO {

    static async getCart(cartId) {
        try {
            return await Cart.findById(cartId);
        } catch (e) {
            throw new Error(`Error retrieving cart: ${e.message}`);
        }
    }

    static async updateCart(cartId, updateData) {
        try {
            return await Cart.findByIdAndUpdate(
                cartId,
                { $set: updateData },
                { new: true, runValidators: true }
            );
        } catch (e) {
            throw new Error(`Error updating cart: ${e.message}`);
        }
    }

    static async createCart(userId, items) {
        try {
            const cart = await new Cart({
                userId: userId,
                items: items
            });
            return cart.save();
        } catch (e) {
            throw new Error(`Error creating cart: ${e.message}`);
        }
    }
}

module.exports = CartDAO;