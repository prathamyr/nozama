// order.dao.js
// DAO responsible for all database operations related to Orders.

const Order = require('../models/order.model');

class OrderDAO {

    // ---------------------------------------------------------
    // ORDER CREATION
    // ---------------------------------------------------------

    static async createOrder(orderData) {
        try {
            const order = new Order(orderData);
            return await order.save();
        } catch (e) {
            throw new Error(`Error creating order: ${e.message}`);
        }
    }


    // ---------------------------------------------------------
    // ORDER RETRIEVAL & HISTORY
    // ---------------------------------------------------------

    // Get order by ID (for user or admin)
    static async getOrderById(orderId) {
        try {
            return await Order.findById(orderId).populate('user');
        } catch (e) {
            throw new Error(`Error retrieving order: ${e.message}`);
        }
    }

    // Get all orders for a specific user
    static async getOrdersByUser(userId) {
        try {
            return await Order.find({ user: userId }).sort({ createdAt: -1 });
        } catch (e) {
            throw new Error(`Error retrieving user orders: ${e.message}`);
        }
    }

    // Admin: list all orders
    static async getAllOrders() {
        try {
            return await Order.find().sort({ createdAt: -1 });
        } catch (e) {
            throw new Error(`Error retrieving all orders: ${e.message}`);
        }
    }


    // ---------------------------------------------------------
    // PAYMENT STATUS UPDATES
    // ---------------------------------------------------------

    static async updatePaymentStatus(orderId, paymentDetails) {
        try {
            return await Order.findByIdAndUpdate(
                orderId,
                { $set: { paymentDetails } },
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error updating payment status: ${e.message}`);
        }
    }


    // ---------------------------------------------------------
    // ORDER STATUS UPDATES (ADMIN)
    // ---------------------------------------------------------

    static async updateOrderStatus(orderId, newStatus) {
        try {
            return await Order.findByIdAndUpdate(
                orderId,
                { orderStatus: newStatus },
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error updating order status: ${e.message}`);
        }
    }
}

module.exports = OrderDAO;
