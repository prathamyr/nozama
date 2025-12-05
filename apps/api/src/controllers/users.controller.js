const bcrypt = require('bcrypt');
const UserDAO = require("../dao/user.dao");
const CartDAO = require("../dao/cart.dao");

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
                const cart = await CartDAO.getCartByUser(user._id);
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

        const cart = await CartDAO.createCart(user._id, req.body.items);
        
        // remove passwordHash before sending
        const sanitizedUser = user.toObject();
        delete sanitizedUser.passwordHash;
        
        res.json({ok: true, user: sanitizedUser, cart: cart});
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