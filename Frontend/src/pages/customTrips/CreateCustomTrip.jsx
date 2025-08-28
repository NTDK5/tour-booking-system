/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { createCustomTrip } from '../../services/customTripsApi';
import { useNavigate } from 'react-router-dom';

const CreateCustomTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    destinations: [''],
    startDate: '',
    endDate: '',
    groupSize: { adults: 1, children: 0 },
    accommodation: 'budget',
    transport: 'car',
    activities: [''],
    budgetRange: { min: '', max: '' },
    specialRequests: ''
  });

  const updateField = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] };
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addArrayItem = (key) => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const updateArrayItem = (key, idx, value) => {
    setForm((prev) => {
      const arr = [...prev[key]];
      arr[idx] = value;
      return { ...prev, [key]: arr };
    });
  };

  const removeArrayItem = (key, idx) => {
    setForm((prev) => {
      const arr = prev[key].filter((_, i) => i !== idx);
      return { ...prev, [key]: arr.length ? arr : [''] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      destinations: form.destinations.filter(Boolean),
      activities: form.activities.filter(Boolean),
      budgetRange: {
        min: form.budgetRange.min ? Number(form.budgetRange.min) : undefined,
        max: form.budgetRange.max ? Number(form.budgetRange.max) : undefined,
      }
    };
    await createCustomTrip(payload);
    navigate('/custom-trip/my-requests');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Custom Trip</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Destinations</h2>
            {form.destinations.map((d, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={d} onChange={(e) => updateArrayItem('destinations', i, e.target.value)} className="flex-1 border p-2 rounded" placeholder="e.g., Addis Ababa" />
                <button type="button" className="px-3 py-2 bg-gray-200 rounded" onClick={() => removeArrayItem('destinations', i)}>Remove</button>
              </div>
            ))}
            <button type="button" className="px-3 py-2 bg-gray-100 rounded" onClick={() => addArrayItem('destinations')}>Add destination</button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Adults</label>
              <input type="number" min="1" value={form.groupSize.adults} onChange={(e) => updateField('groupSize.adults', Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Children</label>
              <input type="number" min="0" value={form.groupSize.children} onChange={(e) => updateField('groupSize.children', Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Accommodation</label>
              <select value={form.accommodation} onChange={(e) => updateField('accommodation', e.target.value)} className="w-full border p-2 rounded">
                <option value="budget">Budget</option>
                <option value="mid-range">Mid-range</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Transport</label>
              <select value={form.transport} onChange={(e) => updateField('transport', e.target.value)} className="w-full border p-2 rounded">
                <option value="car">Car</option>
                <option value="flight">Flight</option>
                <option value="bus">Bus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Budget Range (USD)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={form.budgetRange.min} onChange={(e) => updateField('budgetRange.min', e.target.value)} className="flex-1 border p-2 rounded" />
                <input type="number" placeholder="Max" value={form.budgetRange.max} onChange={(e) => updateField('budgetRange.max', e.target.value)} className="flex-1 border p-2 rounded" />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Activities</h2>
            {form.activities.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={a} onChange={(e) => updateArrayItem('activities', i, e.target.value)} className="flex-1 border p-2 rounded" placeholder="e.g., Hiking" />
                <button type="button" className="px-3 py-2 bg-gray-200 rounded" onClick={() => removeArrayItem('activities', i)}>Remove</button>
              </div>
            ))}
            <button type="button" className="px-3 py-2 bg-gray-100 rounded" onClick={() => addArrayItem('activities')}>Add activity</button>
          </div>
        )}

        {step === 5 && (
          <div className="bg-white p-4 rounded shadow">
            <label className="block text-sm text-gray-600 mb-1">Special Requests</label>
            <textarea value={form.specialRequests} onChange={(e) => updateField('specialRequests', e.target.value)} rows={5} className="w-full border p-2 rounded" placeholder="Any special considerations?" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-gray-600">Step {step} of 5</div>
          <div className="space-x-2">
            {step > 1 && <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 5 && <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setStep(step + 1)}>Next</button>}
            {step === 5 && <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Submit Request</button>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCustomTrip;


