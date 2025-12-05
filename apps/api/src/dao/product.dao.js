const Product = require('../models/product.model');

class ProductDAO {

    static async getAllProducts() {
        try {
            return await Product.find({});
        } catch (e) {
            throw new Error(`Error retrieving users: ${e.message}`);
        }
    }

    static async updateProduct(productId, type) {
        try {
            if (type === "add") {
                return await Product.findByIdAndUpdate(
                    productId,
                    { $inc: { stockQuantity: 1 }}
                );
            } else {
                return await Product.findByIdAndUpdate(
                    productId,
                    { $inc: { stockQuantity: -1 }}
                )
            }
        } catch (e) {
            throw new Error(`Error updating product: ${e.message}`);
        }
    }

}

module.exports = ProductDAO;