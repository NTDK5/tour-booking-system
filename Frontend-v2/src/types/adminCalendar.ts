export type CalendarEventType =
    | 'departure'
    | 'booking'
    | 'staff_assignment'
    | 'vehicle_assignment'
    | 'operational_alert';

export type CalendarEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CalendarAlertPayload {
    code: 'NO_GUIDE_ASSIGNED' | 'NO_VEHICLE_ASSIGNED' | 'PENDING_BOOKING_APPROVAL' | 'OVERBOOKED_DEPARTURE';
    message: string;
    severity: CalendarEventSeverity;
}

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
    metadata?: Record<string, unknown>;
}

export interface UnifiedCalendarEventsResponse {
    range: {
        start: string;
        end: string;
    };
    total: number;
    events: UnifiedCalendarEvent[];
}
