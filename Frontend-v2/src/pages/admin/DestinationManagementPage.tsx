import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useActivities, useCreateActivity, useDeleteActivity } from '@/hooks/useActivities';
import { useCreateDestination, useDeleteDestination, useDestinations } from '@/hooks/useDestinations';

export default function DestinationManagementPage() {
    const { data: destinations = [] } = useDestinations();
    const { data: activities = [] } = useActivities();
    const createDestination = useCreateDestination();
    const deleteDestination = useDeleteDestination();
    const createActivity = useCreateActivity();
    const deleteActivity = useDeleteActivity();

    const [destinationForm, setDestinationForm] = useState({
        name: '',
        region: '',
        description: '',
        basePricePerDay: 120,
        transportSurcharge: 15
    });
    const [activityForm, setActivityForm] = useState({
        title: '',
        description: '',
        category: 'culture',
        duration: '4 Hours',
        destination: ''
    });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Destination Configuration</h2>
                <p className="text-muted-foreground">Manage destinations and destination activities used by custom trip builder.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-surface-light border border-surface-border rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-lg">Create Destination</h3>
                    <input className="w-full h-10 px-3 rounded-lg bg-surface border border-surface-border" placeholder="Name" value={destinationForm.name} onChange={(e) => setDestinationForm({ ...destinationForm, name: e.target.value })} />
                    <input className="w-full h-10 px-3 rounded-lg bg-surface border border-surface-border" placeholder="Region" value={destinationForm.region} onChange={(e) => setDestinationForm({ ...destinationForm, region: e.target.value })} />
                    <textarea className="w-full h-24 px-3 py-2 rounded-lg bg-surface border border-surface-border" placeholder="Description" value={destinationForm.description} onChange={(e) => setDestinationForm({ ...destinationForm, description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" className="w-full h-10 px-3 rounded-lg bg-surface border border-surface-border" placeholder="Base/day" value={destinationForm.basePricePerDay} onChange={(e) => setDestinationForm({ ...destinationForm, basePricePerDay: Number(e.target.value) })} />
                        <input type="number" className="w-full h-10 px-3 rounded-lg bg-surface border border-surface-border" placeholder="Transport" value={destinationForm.transportSurcharge} onChange={(e) => setDestinationForm({ ...destinationForm, transportSurcharge: Number(e.target.value) })} />
                    </div>
                    <Button
                        onClick={() => createDestination.mutate(destinationForm)}
                        isLoading={createDestination.isPending}
                    >
                        Add Destination
                    </Button>
                </div>

                <div className="bg-surface-light border border-surface-border rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-lg">Create Activity</h3>
                    <input className="w-full h-10 px-3 rounded-lg bg-surface border border-surface-border" placeholder="Title" value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} />
                    <textarea className="w-full h-24 px-3 py-2 rounded-lg bg-surface border border-surface-border" placeholder="Description" value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                        <select className="w-full h-10 px-3 rounded-lg bg-surface border border-surface-border" value={activityForm.destination} onChange={(e) => setActivityForm({ ...activityForm, destination: e.target.value })}>
                            <option value="">Select destination</option>
                            {destinations.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                        <select className="w-full h-10 px-3 rounded-lg bg-surface border border-surface-border" value={activityForm.category} onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}>
                            <option value="culture">Culture</option>
                            <option value="nature">Nature</option>
                            <option value="adventure">Adventure</option>
                            <option value="historical">Historical</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <Button
                        onClick={() => createActivity.mutate(activityForm)}
                        isLoading={createActivity.isPending}
                    >
                        Add Activity
                    </Button>
                </div>
            </div>

            <div className="bg-surface-light border border-surface-border rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Destinations</h3>
                <div className="space-y-3">
                    {destinations.map((d: any) => (
                        <div key={d._id} className="flex justify-between items-center p-3 rounded-lg bg-surface border border-surface-border">
                            <div>
                                <div className="font-bold">{d.name}</div>
                                <div className="text-xs text-muted-foreground">{d.region} | ${d.basePricePerDay}/day</div>
                            </div>
                            <Button variant="ghost" onClick={() => deleteDestination.mutate(d._id)}>Delete</Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-surface-light border border-surface-border rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Activities</h3>
                <div className="space-y-3">
                    {activities.map((a: any) => (
                        <div key={a._id} className="flex justify-between items-center p-3 rounded-lg bg-surface border border-surface-border">
                            <div>
                                <div className="font-bold">{a.title} <Badge variant="outline">{a.category}</Badge></div>
                                <div className="text-xs text-muted-foreground">{a.destination?.name || 'Destination'} | {a.duration}</div>
                            </div>
                            <Button variant="ghost" onClick={() => deleteActivity.mutate(a._id)}>Delete</Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
