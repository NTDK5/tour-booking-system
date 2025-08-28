/* eslint-disable no-unused-vars */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyCustomTrips } from '../../services/customTripsApi';
import { Link, useNavigate } from 'react-router-dom';

const MyCustomTrips = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['myCustomTrips'],
    queryFn: getMyCustomTrips,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Custom Trips</h1>
        <Link to="/custom-trip/create" className="px-4 py-2 bg-[#F29404] text-white rounded">Create New</Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm text-gray-600">Destinations</th>
              <th className="px-6 py-3 text-left text-sm text-gray-600">Dates</th>
              <th className="px-6 py-3 text-left text-sm text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm text-gray-600">Proposal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((r) => (
              <tr key={r._id}>
                <td className="px-6 py-3">{(r.destinations || []).join(', ')}</td>
                <td className="px-6 py-3">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'} - {r.endDate ? new Date(r.endDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-3">{r.status}</td>
                <td className="px-6 py-3">
                  {r.proposal?.price ? (
                    <div className="space-y-2">
                      <div className="text-sm">Price: ${r.proposal.price.toFixed(2)}</div>
                      {r.proposal.itinerary && <details className="text-sm"><summary className="cursor-pointer">View Itinerary</summary><pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{r.proposal.itinerary}</pre></details>}
                      {r.proposal.pdfUrl && <a href={r.proposal.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Download PDF</a>}
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={() => navigate('/checkout', { state: { booking: { bookingType: 'tour', tourTitle: 'Custom Trip', numberOfPeople: (r.groupSize?.adults || 1) + (r.groupSize?.children || 0), customTripRequestId: r._id }, totalAmount: r.proposal.price } })}>Proceed to Payment</button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No offer yet</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyCustomTrips;


