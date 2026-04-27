export type CalendarEventType =
    | 'departure'
    | 'booking'
    | 'staff_assignment'
    | 'vehicle_assignment'
    | 'operational_alert';

export type CalendarEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type DepartureReadiness = 'ready' | 'partial' | 'blocked';

export type CalendarAlertCode =
    | 'NO_GUIDE_ASSIGNED'
    | 'NO_VEHICLE_ASSIGNED'
    | 'PENDING_BOOKING_APPROVAL'
    | 'OVERBOOKED_DEPARTURE';

export interface CalendarAlertPayload {
    code: CalendarAlertCode;
    message: string;
    severity: CalendarEventSeverity;
}

export interface DepartureEventMetadata {
    packageId: string;
    readiness: DepartureReadiness;
    capacity: number;
    bookedSeats: number;
    availableSeats: number;
    hasGuideAssigned: boolean;
    hasDriverAssigned: boolean;
    hasVehicleAssigned: boolean;
    guideIds: string[];
    driverIds: string[];
}

export interface BookingEventMetadata {
    bookingType?: string;
    passengerCount: number;
    pendingApproval: boolean;
}

export interface StaffAssignmentEventMetadata {
    role: 'guide' | 'driver';
}

export interface VehicleAssignmentEventMetadata {
    occupancySeats: number;
    vehicleSeats: number | null;
}

export interface AlertEventMetadata {
    alertCode: CalendarAlertCode;
}

export type UnifiedCalendarEventMetadata =
    | DepartureEventMetadata
    | BookingEventMetadata
    | StaffAssignmentEventMetadata
    | VehicleAssignmentEventMetadata
    | AlertEventMetadata
    | Record<string, unknown>;

export interface UnifiedCalendarEvent {
    id: string;
    eventType: CalendarEventType;
    title: string;
    start: string;
    end: string;
    status: string;
    severity: CalendarEventSeverity;
    relatedDepartureId?: string;
    relatedBookingId?: string;
    relatedStaffIds: string[];
    relatedVehicleIds: string[];
    alerts: CalendarAlertPayload[];
    metadata?: UnifiedCalendarEventMetadata;
}

export interface CalendarEventsQuery {
    startDate: Date;
    endDate: Date;
    packageId?: string;
    guideId?: string;
    driverId?: string;
    vehicleId?: string;
    status?: string;
    eventType?: CalendarEventType;
}

export interface UnifiedCalendarEventsResponse {
    range: {
        start: string;
        end: string;
    };
    total: number;
    events: UnifiedCalendarEvent[];
}
