import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AccessibleSelect } from '@/components/ui/AccessibleSelect';
import { useStaffList, useToggleStaffStatus } from '@/hooks/useStaff';

export default function StaffListPage() {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [availability, setAvailability] = useState('');
    const [status, setStatus] = useState('');
    const { data, isLoading } = useStaffList({
        search: search || undefined,
        role: (role || undefined) as any,
        availability: (availability || undefined) as any,
        status: (status || undefined) as any,
    });
    const toggleStatus = useToggleStaffStatus();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Staff Resources</h2>
                    <p className="text-muted-foreground">Manage guides, drivers, coordinators, translators, and support staff.</p>
                </div>
                <Link to="/admin/staff/new">
                    <Button className="gap-2"><Plus size={16} />Add Staff</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2 relative">
                    <Search size={16} className="absolute left-3 top-3.5 text-muted-foreground" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name/email/phone"
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-dark border border-surface-border text-white" />
                </div>
                <AccessibleSelect value={role} onChange={setRole} options={[
                    { value: '', label: 'All roles' }, { value: 'guide', label: 'Guide' }, { value: 'driver', label: 'Driver' },
                    { value: 'coordinator', label: 'Coordinator' }, { value: 'translator', label: 'Translator' }, { value: 'support', label: 'Support' },
                ]} />
                <AccessibleSelect value={availability} onChange={setAvailability} options={[
                    { value: '', label: 'All availability' }, { value: 'available', label: 'Available' }, { value: 'assigned', label: 'Assigned' },
                    { value: 'on_leave', label: 'On leave' }, { value: 'unavailable', label: 'Unavailable' },
                ]} />
                <AccessibleSelect value={status} onChange={setStatus} options={[
                    { value: '', label: 'All status' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' },
                ]} />
            </div>
            <div className="rounded-2xl bg-surface-light border border-surface-border overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface-dark/40 text-xs uppercase text-muted-foreground">
                        <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Availability</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                        {(isLoading ? [] : data || []).map((s) => (
                            <tr key={s._id}>
                                <td className="px-4 py-3"><Link className="font-semibold hover:text-primary" to={`/admin/staff/${s._id}`}>{s.fullName}</Link><p className="text-xs text-muted-foreground">{s.email || '—'}</p></td>
                                <td className="px-4 py-3 capitalize">{s.role}</td>
                                <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{s.availability}</Badge></td>
                                <td className="px-4 py-3"><Badge variant={s.status === 'active' ? 'success' : 'destructive'}>{s.status}</Badge></td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Link to={`/admin/staff/${s._id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                                    <Button size="sm" variant="ghost" onClick={() => toggleStatus.mutate({ id: s._id, active: s.status !== 'active' })}>
                                        {s.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!isLoading && !data?.length && <div className="p-8 text-center text-muted-foreground">No staff members found.</div>}
            </div>
        </div>
    );
}
