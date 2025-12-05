const ProductDAO = require('../dao/product.dao');

exports.getProducts = async (req, res) => {
    try {
        const products = await ProductDAO.getAllProducts();
        res.json({ok:true, products: products});
    } catch (e) {
        res.json({ok: false, error: e.message});
    }
}