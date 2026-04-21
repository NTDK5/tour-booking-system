import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AccessibleSelect } from '@/components/ui/AccessibleSelect';
import { useCreateStaff, useStaffById, useUpdateStaff } from '@/hooks/useStaff';

export default function StaffFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { data } = useStaffById(id);
    const createStaff = useCreateStaff();
    const updateStaff = useUpdateStaff();
    const defaults = useMemo(() => ({
        fullName: data?.fullName || '',
        email: data?.email || '',
        phone: data?.phone || '',
        role: data?.role || 'guide',
        availability: data?.availability || 'available',
        status: data?.status || 'active',
        notes: data?.notes || '',
    }), [data]);
    const { register, handleSubmit, watch, setValue } = useForm({ values: defaults as any });

    return (
        <div className="max-w-2xl space-y-6">
            <div><h2 className="text-2xl font-bold">{isEdit ? 'Edit Staff' : 'Create Staff'}</h2></div>
            <form className="space-y-4 bg-surface-light border border-surface-border rounded-2xl p-6" onSubmit={handleSubmit(async (formData) => {
                if (isEdit && id) await updateStaff.mutateAsync({ id, payload: formData });
                else await createStaff.mutateAsync(formData);
                navigate('/admin/staff');
            })}>
                <Input label="Full Name" {...register('fullName', { required: true })} />
                <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Email" type="email" {...register('email')} />
                    <Input label="Phone" {...register('phone')} />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div><label className="text-sm font-medium">Role</label><input type="hidden" {...register('role')} /><AccessibleSelect value={watch('role')} onChange={(v) => setValue('role', v as any)} options={[{ value: 'guide', label: 'Guide' }, { value: 'driver', label: 'Driver' }, { value: 'coordinator', label: 'Coordinator' }, { value: 'translator', label: 'Translator' }, { value: 'support', label: 'Support' }]} /></div>
                    <div><label className="text-sm font-medium">Availability</label><input type="hidden" {...register('availability')} /><AccessibleSelect value={watch('availability')} onChange={(v) => setValue('availability', v as any)} options={[{ value: 'available', label: 'Available' }, { value: 'assigned', label: 'Assigned' }, { value: 'on_leave', label: 'On leave' }, { value: 'unavailable', label: 'Unavailable' }]} /></div>
                    <div><label className="text-sm font-medium">Status</label><input type="hidden" {...register('status')} /><AccessibleSelect value={watch('status')} onChange={(v) => setValue('status', v as any)} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} /></div>
                </div>
                <div>
                    <label className="text-sm font-medium">Notes</label>
                    <textarea {...register('notes')} className="w-full mt-2 p-3 rounded-xl bg-surface-dark border border-surface-border text-white min-h-[120px]" />
                </div>
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => navigate('/admin/staff')}>Cancel</Button>
                    <Button type="submit">{isEdit ? 'Save Changes' : 'Create Staff'}</Button>
                </div>
            </form>
        </div>
    );
}
