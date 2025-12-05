const User = require('../models/user.model');

// simple and not-bloated
class UserDAO {
    
    //Create a new user (Registration)
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

    //Find user by email (Login)
    static async findUserByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (e) {
            throw new Error(`Error finding user: ${e.message}`);
        }
    }

    
    //Get User Profile (excluding sensitive hash by default if needed)
    //We populate the wishlist to show product details immediately
    static async getUserById(userId) {
        try { 
            return await User.findById(userId).populate('wishlist');
        } catch (e) {
            throw new Error(`Error retrieving profile: ${e.message}`);
        }
    }

    
    //Update basic profile info (Name, etc.)
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

    
    // ----------------------------------------------------------------------

    // ADDRESS MANAGEMENT (Complex Array Logic)    
    //Set default billing or shipping address
    static async setDefaultAddress(userId, type, addressInfo) {
        try {
            const updateField = type === 'billing' ? 'billingAddress' : 'shippingAddressId';
            
            return await User.findByIdAndUpdate(
                userId,
                { [updateField]: addressInfo }
            );
        } catch (e) {
            throw new Error(`Error setting default address: ${e.message}`);
        }
    }

    // ----------------------------------------------------------------------

    // WISHLIST MANAGEMENT - TO BE DONE;

    // ----------------------------------------------------------------------

    // ADMIN FEATURES:
    
    //Get all users (for Admin Dashboard)
    static async getAllUsers() {
        try {
            return await User.find({}, '-passwordHash'); 
        } catch (e) {
            throw new Error(`Error retrieving users: ${e.message}`);
        }
    }
}

module.exports = UserDAO;