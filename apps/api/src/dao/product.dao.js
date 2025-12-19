// product.dao.js
// DAO responsible for all database operations related to Products.

const Product = require('../models/product.model');

class ProductDAO {

    // ---------------------------------------------------------
    // PRODUCT LISTING & SEARCH
    // ---------------------------------------------------------

    // List all active products
    static async getAllProducts() {
        try {
            return await Product.find({ isActive: true });
        } catch (e) {
            throw new Error(`Error fetching products: ${e.message}`);
        }
    }

    // Search products by keyword (uses text index: name, desc, brand)
    static async searchProducts(keyword) {
        try {
            return await Product.find(
                { $text: { $search: keyword } },
                { score: { $meta: 'textScore' } }
            ).sort({ score: { $meta: 'textScore' } });
        } catch (e) {
            throw new Error(`Error searching products: ${e.message}`);
        }
    }

    // Filtering products by category, brand, price range
    static async filterProducts(filters = {}) {
        try {
            const query = { isActive: true };

            if (filters.category) query.category = filters.category;
            if (filters.brand) query.brand = filters.brand;
            if (filters.minPrice || filters.maxPrice) {
                query.price = {};
                if (filters.minPrice) query.price.$gte = filters.minPrice;
                if (filters.maxPrice) query.price.$lte = filters.maxPrice;
            }

            return await Product.find(query);
        } catch (e) {
            throw new Error(`Error filtering products: ${e.message}`);
        }
    }

    // Sort products by price or name
    static async getProductsSorted(sortBy = 'price', order = 'asc') {
        try {
            const sortOrder = order === 'asc' ? 1 : -1;
            const sortField = sortBy === 'name' ? 'name' : 'price';
            
            return await Product.find({ isActive: true })
                .sort({ [sortField]: sortOrder });
        } catch (e) {
            throw new Error(`Error sorting products: ${e.message}`);
        }
    }


    // ---------------------------------------------------------
    // PRODUCT DETAILS
    // ---------------------------------------------------------

    static async getProductById(productId) {
        try {
            return await Product.findById(productId);
        } catch (e) {
            throw new Error(`Error retrieving product: ${e.message}`);
        }
    }


    // ---------------------------------------------------------
    // ADMIN PRODUCT MANAGEMENT
    // ---------------------------------------------------------

    // Create product
    static async createProduct(productData) {
        try {
            const product = new Product(productData);
            return await product.save();
        } catch (e) {
            throw new Error(`Error creating product: ${e.message}`);
        }
    }

    // Update product
    static async updateProduct(productId, updateData) {
        try {
            return await Product.findByIdAndUpdate(
                productId,
                { $set: updateData },
                { new: true, runValidators: true }
            );
        } catch (e) {
            throw new Error(`Error updating product: ${e.message}`);
        }
    }

    static async updateQuantity(productId, quantity) {
        try {
            return await Product.findByIdAndUpdate(
                productId,
                { $set: { stockQuantity: quantity } }
            );
        } catch (e) {
            throw new Error(`Error updating quantity: ${e.message}`);
        }
    }

    // Soft delete (isActive = false)
    static async deactivateProduct(productId) {
        try {
            return await Product.findByIdAndUpdate(
                productId,
                { isActive: false },
                { new: true }
            );
        } catch (e) {
            throw new Error(`Error deactivating product: ${e.message}`);
        }
    }
}

module.exports = ProductDAO;
