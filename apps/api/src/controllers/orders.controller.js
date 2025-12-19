const OrderDAO = require('../dao/order.dao');
const CartDAO = require('../dao/cart.dao');
const ProductDAO = require('../dao/product.dao');
const UserDAO = require('../dao/user.dao');
const { processPayment } = require('../utils/paymentMock');

exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      shippingAddress,
      billingAddress,
      billingInfo
    } = req.body;

    // MVP: must be logged in to checkout (Order requires user)
    if (!userId || userId === 'guest') {
      return res.status(401).json({ ok: false, error: 'Login required to checkout' });
    }

    // Always pull the active user cart
    const cart = await CartDAO.getActiveCart(userId, null);
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ ok: false, error: 'Cart is empty' });
        }
        
        // Validate stock for all items
        for (const item of cart.items) {
            const productId = item.productId?._id || item.productId;
            const product = await ProductDAO.getProductById(productId);
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({ 
                    ok: false, 
                    error: `Insufficient stock for ${product.name}` 
                });
            }
        }
        
        // Calculate totals
        const itemsOrdered = [];
        let subtotal = 0;
        
        for (const item of cart.items) {
            const productId = item.productId?._id || item.productId;
            const product = await ProductDAO.getProductById(productId);
            
            itemsOrdered.push({
                productId: product._id,
                productName: product.name,
                productPrice: product.price,
                thumbnailImg: product.thumbnailImg,
                quantity: item.quantity
            });
            
            subtotal += product.price * item.quantity;
        }
        
        const taxPrice = subtotal * 0.13; // 13% tax
        const shippingPrice = subtotal > 100 ? 0 : 15; // Free shipping over $100
        const totalAmount = subtotal + taxPrice + shippingPrice;
        
        // Process payment
        const paymentDetails = processPayment(billingInfo);
        
        if (paymentDetails.paymentStatus === 'Declined') {
            return res.status(402).json({ 
                ok: false, 
                error: 'Credit Card Authorization Failed',
                paymentDetails 
            });
        }
        
        // Get user email
        const user = await UserDAO.getUserById(userId);
        
        // Create order
        const orderData = {
            user: userId,
            userEmail: user.email,
            itemsOrdered,
            subtotal,
            taxPrice,
            shippingPrice,
            totalAmount,
            shippingAddress,
            billingAddress,
            billingInfo: {
                lastFourDigits: String(billingInfo.cardNumber || '').slice(-4),
                cardBrand: billingInfo.cardBrand
            },
            orderStatus: 'paid',
            paymentDetails
        };
        
        const order = await OrderDAO.createOrder(orderData);
        
        // Reduce inventory for each product
        for (const item of itemsOrdered) {
            const productId = item.productId?._id || item.productId;

            const product = await ProductDAO.getProductById(productId);

            await ProductDAO.updateQuantity(
                productId,
                product.stockQuantity - item.quantity
            );
        }
        
        // Mark cart as converted
        await CartDAO.markAsConverted(cart._id);
        
        res.json({ ok: true, order });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await OrderDAO.getOrderById(orderId);
        
        if (!order) {
            return res.status(404).json({ ok: false, error: 'Order not found' });
        }
        
        res.json({ ok: true, order });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await OrderDAO.getOrdersByUser(userId);
        
        res.json({ ok: true, orders });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const order = await OrderDAO.updateOrderStatus(orderId, status);
        
        res.json({ ok: true, order });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentDetails } = req.body;
        
        const order = await OrderDAO.updatePaymentStatus(orderId, paymentDetails);
        
        res.json({ ok: true, order });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

module.exports = exports;