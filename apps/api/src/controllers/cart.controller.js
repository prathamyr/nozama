const CartDAO = require('../dao/cart.dao');
const ProductDAO = require('../dao/product.dao');

exports.getCart = async (req, res) => {
    try {
        const cart = await CartDAO.getActiveCart(req.params.userId, null);
        res.json({ok: true, cart: cart});
    } catch (e) {
        res.json({ok: false, error: e.message });
    }
}

exports.updateCart = async (req, res) => {
    try {
        const oldCart = await CartDAO.getActiveCart(null, req.body.cartId);
        const oldCartItem = oldCart.items.find(item => item.productId._id.toString() === req.body.productId);
        const oldCartQuantity = oldCartItem ? oldCartItem.quantity : 0;  // if the product doesn't exist in the cart already, treat it as if quantity = 0
        const item = await ProductDAO.getProductById(req.body.productId);
        const itemQuantity = item.stockQuantity;
        const newCart = await CartDAO.addOrUpdateItem(req.body.cartId, req.body.productId, req.body.quantity);
        await ProductDAO.updateQuantity(req.body.productId, itemQuantity-(req.body.quantity - oldCartQuantity));
        res.json({ok: true, cart: newCart});
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