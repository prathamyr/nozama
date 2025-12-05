const Cart = require('../models/cart.model');

class CartDAO {

    static async getCart(cartId) {
        try {
            return await Cart.findById(cartId);
        } catch (e) {
            throw new Error(`Error retrieving cart: ${e.message}`);
        }
    }

    static async updateCart(cartId, productId, type) {
        try {
            if (type === "add") {
                return await Cart.findByIdAndUpdate(
                    cartId,
                    { $inc: { "items.$[elem].quantity": 1 } },
                    { arrayFilters: [{ "elem.productId": productId }], new: true, runValidators: true }
                )
            } else {
                return await Cart.findByIdAndUpdate(
                    cartId,
                    { $inc: { "items.$[elem].quantyt": -1 } },
                    { arrayFilters: [{ "elem.productId": productId }], new: true, runValidators: true }
                )
            }
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