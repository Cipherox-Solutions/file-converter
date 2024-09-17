const Transaction = require('../models/transaction');

// Calculate charge based on file type
const calculateCharge = (fileType) => {
  // Implement your logic here
  return 10.0; // Example value
};

// Call payment service
const callPaymentService = async (charge) => {
  // Implement your payment logic here
  return true; // Example value
};

// Public method to handle credit transactions
const handleTransaction = async (fileType, userId) => {
  try {
    const charge = calculateCharge(fileType);
    const paymentSuccessful = await callPaymentService(charge);

    if (!paymentSuccessful) {
      throw new Error('Payment failed');
    }

    // Create a new transaction
    const transaction = new Transaction({
      user: userId, // Make sure you pass the user ID here
      amount: charge,
    });

    await transaction.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  handleTransaction,
};
