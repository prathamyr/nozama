// inventorylog.dao.js
const InventoryLog = require('../models/inventorylog.model');

class InventoryLogDAO {
    
    // Log inventory change
    static async createLog(productId, adminId, actionType, quantityChange, reason) {
        try {
            const log = new InventoryLog({
                productId,
                adminId,
                actionType,
                quantityChange,
                reason
            });
            return await log.save();
        } catch (e) {
            throw new Error(`Error creating inventory log: ${e.message}`);
        }
    }
    
    // Get logs for a product
    static async getLogsByProduct(productId) {
        try {
            return await InventoryLog.find({ productId })
                .sort({ createdAt: -1 })
                .populate('adminId', 'firstname lastname email');
        } catch (e) {
            throw new Error(`Error retrieving logs: ${e.message}`);
        }
    }
    
    // Get all logs (admin)
    static async getAllLogs() {
        try {
            return await InventoryLog.find()
                .sort({ createdAt: -1 })
                .populate('productId', 'name')
                .populate('adminId', 'firstname lastname');
        } catch (e) {
            throw new Error(`Error retrieving all logs: ${e.message}`);
        }
    }
}

module.exports = InventoryLogDAO;