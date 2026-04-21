import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStaffById } from '@/hooks/useStaff';

export default function StaffDetailsPage() {
    const { id } = useParams();
    const { data: s, isLoading } = useStaffById(id);

    if (isLoading) return <div className="p-8 text-muted-foreground">Loading staff profile...</div>;
    if (!s) return <div className="p-8 text-error">Staff member not found.</div>;

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{s.fullName}</h2>
                    <p className="text-muted-foreground">{s.email || 'No email'}</p>
                </div>
                <Link to={`/admin/staff/${s._id}/edit`}><Button>Edit</Button></Link>
            </div>
            <div className="rounded-2xl border border-surface-border bg-surface-light p-6 grid md:grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs uppercase">Role</p><p className="capitalize font-semibold">{s.role}</p></div>
                <div><p className="text-muted-foreground text-xs uppercase">Availability</p><Badge variant="outline" className="capitalize">{s.availability}</Badge></div>
                <div><p className="text-muted-foreground text-xs uppercase">Status</p><Badge variant={s.status === 'active' ? 'success' : 'destructive'}>{s.status}</Badge></div>
                <div><p className="text-muted-foreground text-xs uppercase">Assignments</p><p>{s.currentAssignmentsCount || 0}</p></div>
                <div className="md:col-span-2"><p className="text-muted-foreground text-xs uppercase">Notes</p><p>{s.notes || 'No notes yet.'}</p></div>
            </div>
        </div>
    );
}
