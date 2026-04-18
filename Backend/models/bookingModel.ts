import { createBookingModel } from '../modules/bookings/models/bookingSchema';

export type { IBooking } from '../modules/bookings/models/bookingSchema';

const Booking = createBookingModel();

export default Booking;
