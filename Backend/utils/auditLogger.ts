import Log from '../models/logModel';

type AuditActionType =
    | 'AUTH'
    | 'BOOKING'
    | 'CUSTOM_TRIP'
    | 'AVAILABILITY'
    | 'USER_MANAGEMENT'
    | 'SYSTEM';

type AuditStatus = 'info' | 'success' | 'warning' | 'error';
type AuditActorRole = 'admin' | 'user' | 'system';

interface AuditPayload {
    user?: any;
    action: string;
    actionType: AuditActionType;
    resource: string;
    resourceId?: string;
    details?: string;
    status?: AuditStatus;
    ip?: string;
    userAgent?: string;
    actorRole?: AuditActorRole;
    metadata?: Record<string, any>;
}

export const createAuditLog = async (payload: AuditPayload) => {
    try {
        await Log.create({
            user: payload.user,
            action: payload.action,
            actionType: payload.actionType,
            resource: payload.resource,
            resourceId: payload.resourceId,
            details: payload.details,
            status: payload.status || 'info',
            ip: payload.ip,
            userAgent: payload.userAgent,
            actorRole: payload.actorRole || (payload.user ? 'user' : 'system'),
            metadata: payload.metadata || {},
        });
    } catch {
        // Audit logging should never break business flow.
    }
};
