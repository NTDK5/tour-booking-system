/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-400">{label}</span>
    <span className="text-white text-right ml-4 break-all">{value ?? '-'}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mt-4">
    <h4 className="text-white font-semibold mb-2">{title}</h4>
    <div className="bg-gray-800 rounded-md p-3">
      {children}
    </div>
  </div>
);

const PaymentDetailsModal = ({ payment, onClose }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!payment?.booking?._id) return;
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/bookings/${payment.booking._id}`,
          { withCredentials: true }
        );
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [payment]);

  if (!payment) return null;
  const bookingType = (booking?.bookingType || payment?.booking?.bookingType || '-').toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-gray-900 w-full max-w-2xl mx-4 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Payment Details</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white">✕</button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <Section title="Payment">
            <InfoRow label="Payment ID" value={payment._id} />
            <InfoRow label="Amount" value={`$${Number(payment.amount || 0).toFixed(2)}`} />
            <InfoRow label="Currency" value={(payment.currency || 'USD').toUpperCase()} />
            <InfoRow label="Status" value={payment.status} />
            {payment.provider && <InfoRow label="Provider" value={payment.provider} />}
            {payment.transactionId && <InfoRow label="Transaction ID" value={payment.transactionId} />}
            {payment.txRef && <InfoRow label="Tx Ref" value={payment.txRef} />}
            {payment.stripePaymentIntentId && <InfoRow label="Stripe Intent" value={payment.stripePaymentIntentId} />}
            {payment.createdAt && <InfoRow label="Created" value={new Date(payment.createdAt).toLocaleString()} />}
          </Section>

          <Section title="Customer">
            <InfoRow label="Name" value={`${payment.booking?.user?.first_name || ''} ${payment.booking?.user?.last_name || ''}`.trim() || '-'} />
            <InfoRow label="Email" value={payment.booking?.user?.email || '-'} />
          </Section>

          <Section title="Booking">
            <InfoRow label="Booking ID" value={payment.booking?._id} />
            <InfoRow label="Type" value={booking?.bookingType || payment.booking?.bookingType || '-'} />
            <InfoRow label="Status" value={booking?.status || payment.booking?.status} />
            <InfoRow label="Payment Method" value={booking?.paymentMethod || payment.booking?.paymentMethod} />
            <InfoRow label="People" value={booking?.numberOfPeople || payment.booking?.numberOfPeople} />
            {bookingType === 'tour' && (
              <>
                <InfoRow label="Tour Title" value={booking?.tour?.title || '-'} />
                <InfoRow label="Destination" value={booking?.tour?.destination || '-'} />
                {booking?.bookingDate && (
                  <InfoRow label="Booking Date" value={new Date(booking.bookingDate).toLocaleDateString()} />
                )}
              </>
            )}
            {bookingType === 'lodge' && (
              <>
                <InfoRow label="Lodge Name" value={booking?.lodge?.name || '-'} />
                <InfoRow label="Location" value={booking?.lodge?.location || '-'} />
                {booking?.checkInDate && (
                  <InfoRow label="Check-in" value={new Date(booking.checkInDate).toLocaleDateString()} />
                )}
                {booking?.checkOutDate && (
                  <InfoRow label="Check-out" value={new Date(booking.checkOutDate).toLocaleDateString()} />
                )}
                {booking?.roomType && <InfoRow label="Room Type" value={booking.roomType} />}
              </>
            )}
            {bookingType === 'car' && (
              <>
                <InfoRow label="Car" value={booking?.car ? `${booking.car.brand} ${booking.car.model} (${booking.car.year})` : '-'} />
                <InfoRow label="Pickup" value={booking?.pickupLocation || '-'} />
                <InfoRow label="Dropoff" value={booking?.dropoffLocation || '-'} />
                {booking?.checkInDate && (
                  <InfoRow label="Pickup Date" value={new Date(booking.checkInDate).toLocaleDateString()} />
                )}
                {booking?.checkOutDate && (
                  <InfoRow label="Return Date" value={new Date(booking.checkOutDate).toLocaleDateString()} />
                )}
              </>
            )}

            {loading && <div className="text-gray-400">Loading booking details...</div>}
            {error && <div className="text-red-400">{error}</div>}
          </Section>
        </div>

        <div className="px-5 py-4 bg-gray-800 border-t border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">Close</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;


