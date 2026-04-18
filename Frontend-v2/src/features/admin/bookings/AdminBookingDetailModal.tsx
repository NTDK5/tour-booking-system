import { useState } from 'react';
import { Loader2, Globe, Hotel, Car } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import type { Booking } from '@/types';
import { useAdminBookingDetail } from '@/hooks/useAdminBookingDetail';

const TABS = ['Summary', 'Travelers', 'Pricing', 'Payments', 'Allocations', 'Documents', 'Audit'] as const;
type TabId = (typeof TABS)[number];

function fmtDate(v?: string | Date) {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : format(d, 'MMM d, yyyy');
}

function SummaryTab({ b }: { b: Booking }) {
    const u = b.user as Record<string, string> | undefined;
    const guest =
        typeof u?.first_name === 'string'
            ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
            : 'Guest';

    return (
        <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Booking #</p>
                <p className="font-mono font-bold">{b.bookingNumber || `#${String(b._id).slice(-8)}`}</p>
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Lifecycle</p>
                <Badge variant="accent">{b.lifecycleStatus || '—'}</Badge>
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Legacy status</p>
                <p className="font-bold uppercase">{b.status}</p>
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Guest</p>
                <p className="font-bold">{guest}</p>
                {typeof u?.email === 'string' && <p className="text-xs text-neutral-500">{u.email}</p>}
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Inventory phase</p>
                <p>{b.inventoryPhase ?? '—'}</p>
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Service</p>
                <div className="flex items-center gap-2">
                    {(b.bookingType || '').toLowerCase() === 'tour' && <Globe size={14} className="text-blue-500" />}
                    {(b.bookingType || '').toLowerCase() === 'lodge' && <Hotel size={14} className="text-amber-500" />}
                    {(b.bookingType || '').toLowerCase() === 'car' && <Car size={14} className="text-green-500" />}
                    <span className="font-medium">
                        {(b.tour as { title?: string })?.title ||
                            (b.lodge as { name?: string })?.name ||
                            `${(b.car as { brand?: string })?.brand || ''} ${(b.car as { model?: string })?.model || ''}` ||
                            b.bookingType}
                    </span>
                </div>
            </div>
            <div className="md:col-span-2">
                <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Dates</p>
                <p>
                    Booking {fmtDate(b.bookingDate)} · Start {fmtDate(b.startDate || b.checkInDate)} · End{' '}
                    {fmtDate(b.endDate || b.checkOutDate)}
                </p>
            </div>
            {b.notes && (
                <div className="md:col-span-2 p-4 rounded-xl bg-surface-dark/40 border border-surface-border">
                    <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Notes</p>
                    <p className="text-sm">{b.notes}</p>
                </div>
            )}
        </div>
    );
}

export function AdminBookingDetailModal({
    bookingId,
    onClose,
}: {
    bookingId: string | null;
    onClose: () => void;
}) {
    const [tab, setTab] = useState<TabId>('Summary');
    const { data: booking, isLoading, isError } = useAdminBookingDetail(bookingId);

    if (!bookingId) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-surface-light border border-surface-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-surface-border">
                    <div>
                        <h3 className="text-xl font-bold text-white">Booking (admin)</h3>
                        <p className="text-sm text-neutral-500 font-mono">
                            {booking?.bookingNumber || `#${bookingId.slice(-8).toUpperCase()}`}
                        </p>
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 px-6 pt-4 border-b border-surface-border">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                                tab === t
                                    ? 'bg-primary text-white'
                                    : 'bg-surface-dark/50 text-neutral-400 hover:text-white'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    )}
                    {isError && (
                        <p className="text-error text-center py-8">Could not load booking detail.</p>
                    )}
                    {!isLoading && booking && (
                        <>
                            {tab === 'Summary' && <SummaryTab b={booking} />}
                            {tab === 'Travelers' && (
                                <div className="space-y-3">
                                    {(booking.travelers?.length ? booking.travelers : []).map((tr, i) => (
                                        <div
                                            key={i}
                                            className="p-4 rounded-xl bg-surface-dark/30 border border-surface-border text-sm"
                                        >
                                            <p className="font-bold">{tr.fullName}</p>
                                            <p className="text-neutral-500 text-xs capitalize">{tr.travelerType}</p>
                                        </div>
                                    ))}
                                    {!booking.travelers?.length && (
                                        <p className="text-neutral-500 text-sm">No traveler manifest on file.</p>
                                    )}
                                </div>
                            )}
                            {tab === 'Pricing' && (
                                <div className="space-y-4 text-sm">
                                    {booking.pricingSnapshot ? (
                                        <>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-neutral-500 text-[10px] uppercase font-bold">
                                                        Subtotal
                                                    </p>
                                                    <p className="font-bold">
                                                        ${booking.pricingSnapshot.subtotal?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-neutral-500 text-[10px] uppercase font-bold">
                                                        Total
                                                    </p>
                                                    <p className="font-bold text-lg">
                                                        ${booking.pricingSnapshot.totalAmount?.toFixed(2)}{' '}
                                                        {booking.pricingSnapshot.currency}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-neutral-500 text-[10px] uppercase font-bold">
                                                        Deposit (quoted)
                                                    </p>
                                                    <p>${booking.pricingSnapshot.depositAmount?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            {booking.pricingSnapshot.lines?.length ? (
                                                <ul className="space-y-2 border border-surface-border rounded-xl p-4">
                                                    {booking.pricingSnapshot.lines.map((ln, idx) => (
                                                        <li key={idx} className="flex justify-between text-xs">
                                                            <span>{ln.label}</span>
                                                            <span>${Number(ln.amount).toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                        </>
                                    ) : (
                                        <p className="text-neutral-500">No pricing snapshot — legacy booking.</p>
                                    )}
                                </div>
                            )}
                            {tab === 'Payments' && (
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                        <div className="p-4 rounded-xl bg-surface-dark/40 border border-surface-border">
                                            <p className="text-[10px] uppercase font-bold text-neutral-500">Paid</p>
                                            <p className="text-xl font-black">
                                                ${booking.paymentSummary?.totalPaid?.toFixed(2) ?? '0'}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-surface-dark/40 border border-surface-border">
                                            <p className="text-[10px] uppercase font-bold text-neutral-500">
                                                Balance due
                                            </p>
                                            <p className="text-xl font-black text-amber-400">
                                                ${booking.paymentSummary?.balanceDue?.toFixed(2) ?? '—'}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-surface-dark/40 border border-surface-border">
                                            <p className="text-[10px] uppercase font-bold text-neutral-500">
                                                Derived status
                                            </p>
                                            <p className="font-bold uppercase">{booking.paymentSummary?.paymentStatus}</p>
                                        </div>
                                    </div>
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-surface-border text-neutral-500 uppercase">
                                                <th className="py-2">Type</th>
                                                <th className="py-2">Amount</th>
                                                <th className="py-2">Status</th>
                                                <th className="py-2">Ref</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-border">
                                            {(booking.paymentLedger || []).map((row, idx) => (
                                                <tr key={row._id || idx}>
                                                    <td className="py-2 capitalize">{row.paymentType}</td>
                                                    <td className="py-2 font-mono">
                                                        ${Number(row.amount).toFixed(2)}
                                                    </td>
                                                    <td className="py-2">{row.status}</td>
                                                    <td className="py-2 font-mono truncate max-w-[120px]">
                                                        {row.transactionReference || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!booking.paymentLedger?.length && (
                                        <p className="text-neutral-500 text-sm">No ledger entries.</p>
                                    )}
                                </div>
                            )}
                            {tab === 'Allocations' && (
                                <div className="text-sm space-y-3">
                                    <p>
                                        <span className="text-neutral-500">Guide: </span>
                                        {booking.assignedGuide ? String(booking.assignedGuide) : '—'}
                                    </p>
                                    <p>
                                        <span className="text-neutral-500">Vehicle: </span>
                                        {booking.assignedVehicle ? String(booking.assignedVehicle) : '—'}
                                    </p>
                                    <p className="text-neutral-400 text-xs">
                                        Assign resources via PATCH /api/admin/bookings/:id/allocations
                                    </p>
                                </div>
                            )}
                            {tab === 'Documents' && (
                                <div className="space-y-3 text-sm">
                                    <p>Voucher: {booking.documents?.voucherUrl || '—'}</p>
                                    <p>Invoice: {booking.documents?.invoiceUrl || '—'}</p>
                                    <p className="text-neutral-500 text-xs">
                                        Stub URLs appear after “issue voucher” admin action.
                                    </p>
                                </div>
                            )}
                            {tab === 'Audit' && (
                                <ul className="space-y-3">
                                    {(booking.auditTrail || []).map((a, idx) => (
                                        <li
                                            key={idx}
                                            className="p-3 rounded-lg bg-surface-dark/40 border border-surface-border text-xs"
                                        >
                                            <p className="font-bold">{a.action}</p>
                                            <p className="text-neutral-500">{fmtDate(a.timestamp)}</p>
                                            {a.notes && <p className="mt-1">{a.notes}</p>}
                                        </li>
                                    ))}
                                    {!booking.auditTrail?.length && (
                                        <li className="text-neutral-500">No embedded audit rows.</li>
                                    )}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
