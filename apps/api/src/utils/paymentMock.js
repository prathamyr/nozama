// src/middleware/paymentMock.js
// Mock payment processor (deny every 3rd request)

let paymentCounter = 0;

// Process payment with dummy logic
const processPayment = (billingInfo) => {
    paymentCounter++;
    
    // Deny every 3rd payment
    const approved = paymentCounter % 3 !== 0;
    
    return {
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentStatus: approved ? 'Approved' : 'Declined',
        paymentDate: new Date(),
        message: approved ? 'Payment successful' : 'Payment declined by issuer'
    };
};

// Validate credit card format (basic check)
const validateCard = (cardNumber) => {
    // Remove spaces/dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    
    // Check if 13-19 digits
    if (!/^\d{13,19}$/.test(cleaned)) {
        return false;
    }
    
    // Luhn algorithm (basic card validation)
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
};

// Get card brand from number
const getCardBrand = (cardNumber) => {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    
    return 'Unknown';
};

// Reset counter (for testing)
const resetCounter = () => {
    paymentCounter = 0;
};

module.exports = {
    processPayment,
    validateCard,
    getCardBrand,
    resetCounter
};