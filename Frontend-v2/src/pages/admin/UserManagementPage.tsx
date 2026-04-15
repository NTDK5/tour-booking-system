import { useState } from 'react';
import {
    Users,
    Shield,
    ShieldAlert,
    Mail,
    MoreVertical,
    UserPlus,
    Key,
    Ban,
    ExternalLink,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useAdminLogs } from '@/hooks/useAdminLogs';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function UserManagementPage() {
    const { data: users, isLoading: usersLoading } = useUsers();
    const { data: logs, isLoading: logsLoading } = useAdminLogs();
    const { mutate: deleteUser } = useDeleteUser();

    const handleDeleteUser = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to remove ${name}?`)) {
            deleteUser(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Access Control</h2>
                    <p className="text-muted-foreground">Manage system users, staff permissions, and administrative roles.</p>
                </div>
                <Button className="gap-2">
                    <UserPlus size={18} />
                    Invite Staff
                </Button>
            </div>

            <div className="bg-surface-light border border-surface-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-surface-border bg-surface-dark/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-dark border border-surface-border outline-none text-sm text-white placeholder:text-neutral-500"
                            placeholder="Search by name, email or ID..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-dark/30 text-xs uppercase tracking-wider text-muted-foreground border-b border-surface-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {usersLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={3} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                                ))
                            ) : users?.map((user: any) => (
                                <tr key={user._id} className="hover:bg-surface-dark/10 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-surface-dark flex items-center justify-center font-bold text-primary border border-surface-border uppercase">
                                                {user.first_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{user.first_name} {user.last_name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Mail size={10} />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'admin' ? (
                                                <Badge variant="accent" className="gap-1"><Shield size={12} /> Admin</Badge>
                                            ) : (
                                                <Badge variant="outline">User</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" title="Reset Password"><Key size={16} /></Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-error"
                                                title="Remove User"
                                                onClick={() => handleDeleteUser(user._id, `${user.first_name} ${user.last_name}`)}
                                            >
                                                <Ban size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-surface-light border border-surface-border rounded-2xl">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-error" />
                        Audit Log Highlights
                    </h3>
                    <div className="space-y-3">
                        {logsLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : logs?.length > 0 ? (
                            logs.slice(0, 5).map((log: any) => (
                                <div key={log._id} className="p-3 bg-surface-dark/30 rounded-lg text-xs flex flex-col gap-1 border-l-2 border-primary/50">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-white uppercase tracking-tighter">{log.action}</span>
                                        <span className="text-muted-foreground italic">
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-neutral-400 capitalize">{log.resource}: {log.details}</p>
                                    <p className="text-[10px] text-primary/70">By {log.user?.first_name || 'System'}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-muted-foreground italic">No recent activity logs available.</div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-surface-light border border-surface-border rounded-2xl border-dashed">
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <Users size={48} className="mb-4 text-muted-foreground" />
                        <h3 className="font-bold">System Health</h3>
                        <p className="text-sm mt-1">API Status: Operational</p>
                        <p className="text-sm">DB Latency: 24ms</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
