const User = require('../models/user.model');

// simple and not-bloated
export default class UserDAO {
    
    //Create a new user (Registration)
    static async createUser(userData) {
        try {
            const user = new User(userData);
            return await user.save();
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

    
    //Add a new address to the list
    static async addAddress(userId, addressData) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { $push: { addresses: addressData } }, // Appends to array
                { new: true, runValidators: true }
            );
        } catch (e) {
            throw new Error(`Error adding address: ${e.message}`);
        }
    }

    
    //Remove an address by its _id
    static async removeAddress(userId, addressId) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { $pull: { addresses: { _id: addressId } } }, // Removes specific item
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error removing address: ${e.message}`);
        }
    }

    
    //Set default billing or shipping address
    static async setDefaultAddress(userId, addressId, type) {
        try {
            const updateField = type === 'billing' ? 'defaultBillingAddressId' : 'defaultShippingAddressId';
            
            return await User.findByIdAndUpdate(
                userId,
                { [updateField]: addressId },
                { new: true }
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