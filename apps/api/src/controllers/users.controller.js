const bcrypt = require('bcrypt');
const UserDAO = require("../dao/user.dao");
const CartDAO = require("../dao/cart.dao");

exports.getUsers = async (req, res) => {
    try {
        const users = await UserDAO.getAllUsers();
        res.json({users: users})
    } catch (e) {
        res.json({error: e.message});
    }
};

exports.loginUser = async (req, res) => {
    try {
        const user = await UserDAO.findUserByEmail(req.body.email);
        // TODO: Add password verification and JWT token generation
        res.json({ok: true, user: user});
    } catch (e) {
        res.json({error: e.message});
    }
};

// need to add JWT functionality!!
exports.signupUser = async (req, res) => {
    console.log("endpoint reached successfully");
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        const user = await UserDAO.createUser(req.body.firstName, req.body.lastName, req.body.email, hash);

        const cart = await CartDAO.createCart(user._id, req.body.items);
        res.json({ok: true, user: user, cart: cart});
    } catch (e) {
        res.json({error: e.message});
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