import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Inner = () => {
    const stripe = useStripe();
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        const clientSecret = new URLSearchParams(location.search).get('payment_intent_client_secret');
        if (!stripe || !clientSecret) return;
        const check = async () => {
            const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
            if (!paymentIntent) return;
            if (paymentIntent.status === 'succeeded') {
                setStatus('success');
                setTimeout(() => navigate('/profile/booking_history'), 2000);
            } else if (paymentIntent.status === 'processing') {
                setStatus('processing');
            } else {
                setStatus('failed');
            }
        };
        check();
    }, [stripe, location.search, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow p-6 text-center">
                {status === 'checking' && <div>Checking payment...</div>}
                {status === 'processing' && <div>Processing payment...</div>}
                {status === 'success' && <div className="text-green-600 font-semibold">Payment Successful!</div>}
                {status === 'failed' && (
                    <div>
                        <div className="text-red-600 font-semibold">Payment Failed</div>
                        <button onClick={() => navigate('/checkout')} className="mt-4 bg-[#FFDA32] text-white py-2 px-4 rounded">Try Again</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StripeResult = () => (
    <Elements stripe={stripePromise}>
        <Inner />
    </Elements>
);

export default StripeResult;


