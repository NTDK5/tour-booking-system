import axios from 'axios';

export const initiatePayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/payments/create-paypal-payment`,
      paymentData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Payment initialization failed'
    );
  }
};

export const createStripePaymentIntent = async ({ amount, currency = 'usd', bookingId, description }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/payments/stripe/create-intent`,
      { amount, currency, bookingId, description },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create Stripe PaymentIntent');
  }
};

// Removed Chapa verifyPayment
