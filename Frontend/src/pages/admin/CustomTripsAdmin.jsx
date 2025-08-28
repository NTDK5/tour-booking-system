import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { setProposalAdmin, updateStatusAdmin, getAllCustomTrips } from '../../services/customTripsApi';
// import LoadingScreen from '../../components/Loading';

const CustomTripsAdmin = () => {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [active, setActive] = useState(null);
    const [proposal, setProposal] = useState({ itinerary: '', price: '', pdfUrl: '' });

    const { data: customTrips, isError } = useQuery({
        queryKey: ['customTrips'],
        queryFn: getAllCustomTrips,
    });

    const filtered = useMemo(() => {
        if (!customTrips) return [];
        if (statusFilter === 'all') return customTrips;
        return customTrips.filter((t) => t.status === statusFilter);
    }, [customTrips, statusFilter]);

    const mutationProposal = useMutation({
        mutationFn: async ({ id, payload }) => setProposalAdmin(id, payload),
        onSuccess: () => queryClient.invalidateQueries(['customTrips'])
    });

    const mutationStatus = useMutation({
        mutationFn: async ({ id, status }) => updateStatusAdmin(id, status),
        onSuccess: () => queryClient.invalidateQueries(['customTrips'])
    });

    // if (isLoading) return <LoadingScreen />;
    if (isError) return <div>Error loading requests</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-[#F29404] mb-8">Custom Trip Requests</h1>
            <div className="mb-4 flex items-center gap-3">
                <label className="text-sm">Filter by status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 rounded">
                    <option value="all">All</option>
                    {['Pending', 'Reviewed', 'Offer Sent', 'Booked', 'Cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left">User</th>
                            <th className="px-6 py-4 text-left">Destinations</th>
                            <th className="px-6 py-4 text-left">Travel Dates</th>
                            <th className="px-6 py-4 text-left">Budget</th>
                            <th className="px-6 py-4 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filtered?.map((trip) => (
                            <tr key={trip._id}>
                                <td className="px-6 py-4">{trip.user?.first_name + " " + trip.user?.last_name}</td>
                                <td className="px-6 py-4">
                                    {trip.destinations.join(', ')}
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(trip.startDate).toLocaleDateString()} -
                                    {new Date(trip.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">${trip?.budgetRange?.min || 0} - ${trip?.budgetRange?.max || 0}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm ${trip.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : trip.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' : trip.status === 'Offer Sent' ? 'bg-purple-100 text-purple-800' : trip.status === 'Booked' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {trip.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => setActive(trip)}>Open</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {active && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setActive(null)} />
                    <div className="relative bg-white w-full max-w-3xl mx-4 rounded shadow-lg overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <h3 className="text-lg font-semibold">Request Details</h3>
                            <button onClick={() => setActive(null)}>✕</button>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">User</div>
                                <div className="font-medium">{active.user?.first_name} {active.user?.last_name}</div>
                                <div className="text-sm text-gray-600 mt-3">Destinations</div>
                                <div>{(active.destinations || []).join(', ')}</div>
                                <div className="text-sm text-gray-600 mt-3">Dates</div>
                                <div>{active.startDate ? new Date(active.startDate).toLocaleDateString() : '-'} - {active.endDate ? new Date(active.endDate).toLocaleDateString() : '-'}</div>
                                <div className="text-sm text-gray-600 mt-3">Group Size</div>
                                <div>{active.groupSize?.adults || 0} adults, {active.groupSize?.children || 0} children</div>
                                <div className="text-sm text-gray-600 mt-3">Preferences</div>
                                <div>Accommodation: {active.accommodation} | Transport: {active.transport}</div>
                                <div className="text-sm text-gray-600 mt-3">Activities</div>
                                <div>{(active.activities || []).join(', ') || '-'}</div>
                                <div className="text-sm text-gray-600 mt-3">Special Requests</div>
                                <div className="whitespace-pre-wrap">{active.specialRequests || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Status</div>
                                <select value={active.status} onChange={(e) => mutationStatus.mutate({ id: active._id, status: e.target.value })} className="border p-2 rounded w-full">
                                    {['Pending', 'Reviewed', 'Offer Sent', 'Booked', 'Cancelled'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <div className="text-sm text-gray-600 mt-4">Proposal (Admin)</div>
                                <textarea value={proposal.itinerary} onChange={(e) => setProposal({ ...proposal, itinerary: e.target.value })} placeholder="Day-by-day itinerary" rows={6} className="border p-2 rounded w-full" />
                                <div className="flex gap-2 mt-2">
                                    <input type="number" placeholder="Price (USD)" value={proposal.price} onChange={(e) => setProposal({ ...proposal, price: e.target.value })} className="border p-2 rounded w-1/2" />
                                    <input type="url" placeholder="PDF URL (optional)" value={proposal.pdfUrl} onChange={(e) => setProposal({ ...proposal, pdfUrl: e.target.value })} className="border p-2 rounded w-1/2" />
                                </div>
                                <button className="mt-3 px-4 py-2 bg-[#F29404] text-white rounded" onClick={() => mutationProposal.mutate({ id: active._id, payload: { itinerary: proposal.itinerary, price: Number(proposal.price), pdfUrl: proposal.pdfUrl } })}>Send Offer</button>
                                {active.proposal?.price && (
                                    <div className="mt-4 bg-gray-50 p-3 rounded">
                                        <div className="font-medium">Current Offer</div>
                                        <div>Price: ${active.proposal.price}</div>
                                        {active.proposal.itinerary && <details className="mt-1"><summary>Itinerary</summary><pre className="whitespace-pre-wrap text-xs">{active.proposal.itinerary}</pre></details>}
                                        {active.proposal.pdfUrl && <a href={active.proposal.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Download PDF</a>}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="px-5 py-4 bg-gray-50 border-t text-right">
                            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setActive(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomTripsAdmin; 