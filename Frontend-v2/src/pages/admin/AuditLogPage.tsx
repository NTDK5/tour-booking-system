import {
    Search,
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
import { useAdminLogs } from '@/hooks/useAdminLogs';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function AuditLogPage() {
    const [search, setSearch] = useState('');
    const { data: logs = [], isLoading, isError, refetch } = useAdminLogs();

    const filteredLogs = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return logs;
        return logs.filter((log: any) =>
            String(log.action || '').toLowerCase().includes(q) ||
            String(log.resource || '').toLowerCase().includes(q) ||
            String(log.details || '').toLowerCase().includes(q) ||
            String(log.user?.first_name || '').toLowerCase().includes(q) ||
            String(log.user?.last_name || '').toLowerCase().includes(q) ||
            String(log.user?.email || '').toLowerCase().includes(q)
        );
    }, [logs, search]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />;
    }

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
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-dark border border-surface-border outline-none text-sm text-white placeholder:text-neutral-500"
                            placeholder="Search logs by action, user, or target..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y divide-surface-border">
                    {filteredLogs.map((log: any) => (
                        <div key={log._id} className="p-4 hover:bg-surface-dark/5 transition-colors flex flex-col md:flex-row gap-4">
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
                                            {log.user ? `${log.user.first_name || ''} ${log.user.last_name || ''}`.trim() || log.user.email : 'System'}
                                        </span>
                                        <span className="text-muted-foreground">ON</span>
                                        <span className="text-foreground">{log.resource}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{log.details}</p>
                                </div>
                            </div>
                            <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{String(log._id).slice(-8).toUpperCase()}</span>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Clock size={12} />
                                    {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : 'N/A'}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredLogs.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">No logs found for your search.</div>
                    )}
                </div>

                <div className="p-4 border-t border-surface-border text-center">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Load Older Logs</Button>
                </div>
            </div>
        </div>
    );
}
