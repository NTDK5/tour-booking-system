import { useState } from 'react';
import {
    History,
    Search,
    Filter,
    AlertCircle,
    CheckCircle,
    Info,
    User,
    Shield,
    Clock,
    Database,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const auditLogs = [
    { id: "LOG-551", action: "UPDATE_AVAILABILITY", user: "sara_admin", target: "Guge Lodge", timestamp: "10 mins ago", status: "success", details: "Blocked dates March 12-15 for maintenance" },
    { id: "LOG-550", action: "CREATE_BOOKING", user: "system_cron", target: "John Doe", timestamp: "1 hour ago", status: "success", details: "Auto-confirmed online booking BK-1002" },
    { id: "LOG-549", action: "FAILED_LOGIN", user: "unknown_ip", target: "admin_panel", timestamp: "3 hours ago", status: "warning", details: "Failed login attempt from 192.168.1.1 (5 attempts)" },
    { id: "LOG-548", action: "DELETE_RESOURCE", user: "abebe_super", target: "Old Car TR-09", timestamp: "5 hours ago", status: "success", details: "Manually removed retired vehicle from fleet" },
    { id: "LOG-547", action: "EXPORT_DATA", user: "sara_admin", target: "Revenue_Report_Q1", timestamp: "1 day ago", status: "success", details: "Downloaded comprehensive financial report" },
];

export default function AuditLogPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Audit Log</h2>
                    <p className="text-muted-foreground">Track all administrative actions, security events, and automated tasks.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Database size={18} />
                        Retention Policy
                    </Button>
                    <Badge variant="accent" className="h-9 px-4 flex items-center gap-2">
                        <Activity size={14} className="animate-pulse" />
                        Logging: ACTIVE
                    </Badge>
                </div>
            </div>

            <div className="bg-surface-light border border-surface-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-surface-border bg-surface-dark/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-dark border border-surface-border outline-none text-sm"
                            placeholder="Search logs by action, user, or target..."
                        />
                    </div>
                </div>

                <div className="divide-y divide-surface-border">
                    {auditLogs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-surface-dark/5 transition-colors flex flex-col md:flex-row gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`p-2 rounded-lg mt-1 ${log.status === 'success' ? 'bg-success/10 text-success' :
                                    log.status === 'warning' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                                    }`}>
                                    {log.status === 'success' ? <CheckCircle size={20} /> :
                                        log.status === 'warning' ? <Shield size={20} /> : <Info size={20} />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap text-sm font-semibold uppercase tracking-tight">
                                        <span className="text-primary">{log.action}</span>
                                        <span className="text-muted-foreground">BY</span>
                                        <span className="flex items-center gap-1 text-foreground">
                                            <User size={12} className="text-muted-foreground" />
                                            {log.user}
                                        </span>
                                        <span className="text-muted-foreground">ON</span>
                                        <span className="text-foreground">{log.target}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{log.details}</p>
                                </div>
                            </div>
                            <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{log.id}</span>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Clock size={12} />
                                    {log.timestamp}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-surface-border text-center">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Load Older Logs</Button>
                </div>
            </div>
        </div>
    );
}
