// cart.dao.js
// DAO responsible for all database operations related to Carts.

const Cart = require('../models/cart.model');

class CartDAO {

    // ---------------------------------------------------------
    // FETCHING USER / GUEST CARTS
    // ---------------------------------------------------------

    // Get active cart (open) for user or guest
    static async getActiveCart(userId, guestSessionId) {
        try {
            const query = { status: 'open' };

            if (userId) {
                query.userId = userId;
            } else {
                if (!guestSessionId) return null;
                query.guestSessionId = guestSessionId;
            }

            return await Cart.findOne(query).populate('items.productId');
        } catch (e) {
            throw new Error(`Error retrieving cart: ${e.message}`);
        }
    }


    // ---------------------------------------------------------
    // CART CREATION
    // ---------------------------------------------------------

    static async createCart(userId, guestSessionId = null) {
        try {
            const cart = new Cart({ userId, guestSessionId });
            return await cart.save();
        } catch (e) {
            throw new Error(`Error creating cart: ${e.message}`);
        }
    }

    // ---------------------------------------------------------
    // CLEAR CART
    // ---------------------------------------------------------
    
    // Clear all items from cart
    static async clearCart(cartId) {
        try {
            return await Cart.findByIdAndUpdate(
                cartId,
                { $set: { items: [] } },
                { new: true }
            ).populate('items.productId'); // ✅ FIX: Populate after clearing
        } catch (e) {
            throw new Error(`Error clearing cart: ${e.message}`);
        }
    }


    // ---------------------------------------------------------
    // CART UPDATES (ADD / REMOVE / UPDATE ITEMS)
    // ---------------------------------------------------------

    // Add or update item in cart
    static async addOrUpdateItem(cartId, productId, quantity) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Cart not found');

            const existingItem = cart.items.find(
                item => item.productId.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += Number(quantity);
            } else {
                cart.items.push({ productId, quantity });
            }

            await cart.save();
            
            // ✅ FIX: Populate the saved cart before returning
            await cart.populate('items.productId');
            return cart;
        } catch (e) {
            throw new Error(`Error updating cart: ${e.message}`);
        }
    }

    static async removeItem(cartId, productId) {
        try {
            return await Cart.findByIdAndUpdate(
                cartId,
                { $pull: { items: { productId } } },
                { new: true }
            ).populate('items.productId'); // ✅ FIX: Populate after removing
        } catch (e) {
            throw new Error(`Error removing item: ${e.message}`);
        }
    }

    static async updateQuantity(cartId, productId, quantity) {
        try {
            return await Cart.findOneAndUpdate(
                { _id: cartId, "items.productId": productId },
                { $set: { "items.$.quantity": quantity } },
                { new: true }
            ).populate('items.productId'); // ✅ FIX: Populate after updating
        } catch (e) {
            throw new Error(`Error updating quantity: ${e.message}`);
        }
    }


    // ---------------------------------------------------------
    // CART STATUS UPDATES
    // ---------------------------------------------------------

    static async markAsConverted(cartId) {
        try {
            return await Cart.findByIdAndUpdate(
                cartId,
                { status: 'converted' },
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error updating cart status: ${e.message}`);
        }
    }
}

module.exports = CartDAO;