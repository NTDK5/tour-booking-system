/* eslint-disable react/prop-types */
import React from 'react';

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white text-right ml-4">{value}</span>
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

const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const type = booking.bookingType && booking.bookingType.toLowerCase();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative bg-gray-900 w-full max-w-2xl mx-4 rounded-lg shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Booking Details</h3>
                    <button onClick={onClose} className="text-gray-300 hover:text-white">✕</button>
                </div>

                <div className="p-5 max-h-[80vh] overflow-y-auto">
                    <Section title="General">
                        <InfoRow label="Booking ID" value={booking._id} />
                        <InfoRow label="Type" value={booking.bookingType} />
                        <InfoRow label="Status" value={booking.status} />
                        <InfoRow label="Total Price" value={`$${(booking.totalPrice || 0).toFixed(2)}`} />
                        {booking.createdAt && (
                            <InfoRow label="Created" value={new Date(booking.createdAt).toLocaleString()} />
                        )}
                        {booking.paymentMethod && (
                            <InfoRow label="Payment Method" value={booking.paymentMethod} />
                        )}
                        {booking.notes && (
                            <InfoRow label="Notes" value={booking.notes} />
                        )}
                    </Section>

                    <Section title="Customer">
                        <InfoRow label="Name" value={`${booking.user?.first_name || ''} ${booking.user?.last_name || ''}`} />
                        <InfoRow label="Email" value={booking.user?.email || '-'} />
                    </Section>

                    {type === 'tour' && (
                        <Section title="Tour">
                            <InfoRow label="Title" value={booking.tour?.title || '-'} />
                            <InfoRow label="Destination" value={booking.tour?.destination || '-'} />
                            {booking.bookingDate && (
                                <InfoRow label="Booking Date" value={new Date(booking.bookingDate).toLocaleDateString()} />
                            )}
                            <InfoRow label="People" value={booking.numberOfPeople || 1} />
                        </Section>
                    )}

                    {type === 'lodge' && (
                        <Section title="Lodge">
                            <InfoRow label="Name" value={booking.lodge?.name || '-'} />
                            <InfoRow label="Location" value={booking.lodge?.location || '-'} />
                            {booking.checkInDate && (
                                <InfoRow label="Check-in" value={new Date(booking.checkInDate).toLocaleDateString()} />
                            )}
                            {booking.checkOutDate && (
                                <InfoRow label="Check-out" value={new Date(booking.checkOutDate).toLocaleDateString()} />
                            )}
                            {booking.roomType && (
                                <InfoRow label="Room Type" value={booking.roomType} />
                            )}
                            <InfoRow label="People" value={booking.numberOfPeople || 1} />
                        </Section>
                    )}

                    {type === 'car' && (
                        <Section title="Car Rental">
                            <InfoRow label="Car"
                                value={booking.car ? `${booking.car.brand} ${booking.car.model} (${booking.car.year})` : '-'} />
                            <InfoRow label="Transmission" value={booking.car?.transmission || '-'} />
                            <InfoRow label="Fuel" value={booking.car?.fuelType || '-'} />
                            <InfoRow label="Seats" value={booking.car?.seats || '-'} />
                            <InfoRow label="Pickup" value={booking.pickupLocation || '-'} />
                            <InfoRow label="Dropoff" value={booking.dropoffLocation || '-'} />
                            {booking.checkInDate && (
                                <InfoRow label="Pickup Date" value={new Date(booking.checkInDate).toLocaleDateString()} />
                            )}
                            {booking.checkOutDate && (
                                <InfoRow label="Return Date" value={new Date(booking.checkOutDate).toLocaleDateString()} />
                            )}
                        </Section>
                    )}
                </div>

                <div className="px-5 py-4 bg-gray-800 border-t border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">Close</button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal;


