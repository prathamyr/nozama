const CartDAO = require('../dao/cart.dao');

exports.getCart = async (req, res) => {
    try {
        const cart = await CartDAO.getCart(req.body.cartId);
        res.json({ok: true, cart: cart});
    } catch (e) {
        res.json({ok: false, error: e.message });
    }
}

exports.updateCart = async (req, res) => {
    try {
        const cart = await CartDAO.updateCart(req.body.cartId, req.body.updateData, req.body.type);
        res.json({ok: true, cart: cart});
    } catch (e) {
        res.json({ok: false, error: e.message });
    }
}

exports.createCart = async (req, res) => {
    try {
        const cart = await CartDAO.createCart(req.body.cartId, req.body.items);
        res.json({ok: true, cart: cart});
    } catch (e) {
        res.json({ok: false, error: e.message});
    }
}