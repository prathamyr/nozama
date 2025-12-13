const bcrypt = require('bcrypt');
const UserDAO = require("../dao/user.dao");
const CartDAO = require("../dao/cart.dao");
const ProductDAO = require("../dao/product.dao");

exports.getUsers = async (req, res) => {
    try {
        const users = await UserDAO.getAllUsers();
        res.json({ok: true, users: users})
    } catch (e) {
        res.json({ok: false, error: e.message});
    }
};

exports.loginUser = async (req, res) => {
    try {
        const user = await UserDAO.findUserByEmail(req.body.email);
        if (user != null) {
            const authenticated = await bcrypt.compare(req.body.password, user.passwordHash);
            if (authenticated) {
                const cart = await CartDAO.getActiveCart(user._id, null);
                // remove passwordHash before sending
                const sanitizedUser = user.toObject();
                delete sanitizedUser.passwordHash;
                res.json({ok: true, user: sanitizedUser, cart: cart});
            } else {
                res.json({ok: false, error: "Incorrect email or password"});
            }
        } else {
            res.json({ok: false, error: "Incorrect email or password"});
        }
    } catch (e) {
        res.json({ok: false, error: "Incorrect email or password"});
    }
};

// need to add JWT functionality!!
exports.signupUser = async (req, res) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        const user = await UserDAO.createUser(req.body.firstName, req.body.lastName, req.body.email, hash);

        // user cart will only contain the productId and the quantities of each item in the cart
        const cart = await CartDAO.createCart(user._id);
        
        // Use Promise.all to wait for all items to be added
        if (req.body.items.length > 0) {
            await Promise.all(req.body.items.map(async (element) => {
                await CartDAO.addOrUpdateItem(cart._id, element.productId, element.quantity);
                
                // update product inventory quantity
                const existingItem = await ProductDAO.getProductById(element.productId);
                const existingItemQuantity = existingItem.stockQuantity;
                await ProductDAO.updateQuantity(element.productId, existingItemQuantity-(element.quantity));
            }));
        }

        const newCart = await CartDAO.getActiveCart(user._id, null);
        
        // remove passwordHash before sending
        const sanitizedUser = user.toObject();
        delete sanitizedUser.passwordHash;
        
        res.json({ok: true, user: sanitizedUser, cart: newCart});
    } catch (e) {
        res.json({ok: false, error: e.message});
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const address = await UserDAO.setDefaultAddress(req.body.userId, req.body.address);
        res.json({ok: true, address: address});
    } catch (e) {
        res.json({error: e.message});
    }
}