const ProductDAO = require('../dao/product.dao');

exports.getProducts = async (req, res) => {
    try {
        const products = await ProductDAO.getAllProducts();
        res.json({ ok: true, products });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await ProductDAO.getProductById(productId);
        
        if (!product) {
            return res.status(404).json({ ok: false, error: 'Product not found' });
        }
        
        res.json({ ok: true, product });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ ok: false, error: 'Keyword required' });
        }
        
        const products = await ProductDAO.searchProducts(keyword);
        res.json({ ok: true, products });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.filterProducts = async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice } = req.query;
        
        const filters = {
            category,
            brand,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
        };
        
        const products = await ProductDAO.filterProducts(filters);
        res.json({ ok: true, products });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.sortProducts = async (req, res) => {
    try {
        const { sortBy = 'price', order = 'asc' } = req.query;
        
        const products = await ProductDAO.getProductsSorted(sortBy, order);
        res.json({ ok: true, products });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

module.exports = exports;