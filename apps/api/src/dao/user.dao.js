// user.dao.js
// DAO responsible for all database operations related to User.

const User = require('../models/user.model');

class UserDAO {

    // ---------------------------------------------------------
    // USER CREATION / BASIC PROFILE MANAGEMENT
    // ---------------------------------------------------------
    
    // Create a new user (Registration)
    static async createUser(firstName, lastName, email, password) {
        try {
            const user = new User({
                firstname: firstName,
                lastname: lastName,
                email: email,
                passwordHash: password
            });
            await user.save();
            return user;
        } catch (e) {
            throw new Error(`Unable to register user: ${e.message}`);
        }
    }

    // Find user by email (Login)
    static async findUserByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (e) {
            throw new Error(`Error finding user by email: ${e.message}`);
        }
    }

    
    // Get User Profile (excluding sensitive hash by default if needed)
    // We populate the wishlist to show product details immediately
    static async getUserById(userId) {
        try { 
            return await User.findById(userId).populate('wishlist');
        } catch (e) {
            throw new Error(`Error retrieving profile: ${e.message}`);
        }
    }

    
    // Update basic profile info (name, etc.)
    static async updateProfile(userId, updateData) {
        try {
            return await User.findByIdAndUpdate(
                userId, 
                { $set: updateData }, 
                { new: true, runValidators: true }
            );
        } catch (e) {
            throw new Error(`Error updating profile: ${e.message}`);
        }
    }

    // Add payment method
    static async addPaymentMethod(userId, paymentData) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { $push: { paymentMethods: paymentData } },
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error adding payment method: ${e.message}`);
        }
    }

    // Remove payment method
    static async removePaymentMethod(userId, paymentMethodId) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { $pull: { paymentMethods: { _id: paymentMethodId } } },
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error removing payment method: ${e.message}`);
        }
    }

    // ---------------------------------------------------------
    // ADDRESS MANAGEMENT
    // ---------------------------------------------------------

    // Update billing or shipping address
    static async setAddress(userId, type, addressData) {
        try {
            const updateField = type === 'billing' ? 'billingAddress' : 'shippingAddress';

            return await User.findByIdAndUpdate(
                userId,
                { [updateField]: addressData },
                { new: true, runValidators: true }
            );
        } catch (e) {
            throw new Error(`Error updating address: ${e.message}`);
        }
    }

    // Remove shipping or billing address (sets to null)
    static async removeAddress(userId, type) {
        try {
            const field = type === 'billing' ? 'billingAddress' : 'shippingAddress';

            return await User.findByIdAndUpdate(
                userId,
                { [field]: null },
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error removing address: ${e.message}`);
        }
    }


    // ----------------------------------------------------------------------
    // WISHLIST MANAGEMENT
    // ----------------------------------------------------------------------
    
    static async addToWishlist(userId, productId) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { $addToSet: { wishlist: productId } }, // prevents duplicates
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error adding wishlist item: ${e.message}`);
        }
    }

    static async removeFromWishlist(userId, productId) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { $pull: { wishlist: productId } },
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error removing wishlist item: ${e.message}`);
        }
    }
    
    
    // ---------------------------------------------------------
    // ADMIN (DASHBOARD)
    // ---------------------------------------------------------
    
    static async getAllUsers() {
        try {
            return await User.find({}, '-passwordHash'); 
        } catch (e) {
            throw new Error(`Error retrieving all users: ${e.message}`);
        }
    }
}

module.exports = UserDAO;
