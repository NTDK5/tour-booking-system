import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AccessibleSelect } from '@/components/ui/AccessibleSelect';
import { adminPackagesApi } from '@/api/packages';
import { tourKeys } from '@/hooks/useTours';
import type { Tour } from '@/types';

type TabId =
    | 'basic'
    | 'route'
    | 'itinerary'
    | 'pricing'
    | 'availability'
    | 'inclusions'
    | 'addons'
    | 'media'
    | 'bookingRules'
    | 'resources';

const TABS: { id: TabId; label: string }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'route', label: 'Route & Duration' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'availability', label: 'Availability' },
    { id: 'inclusions', label: 'Inclusions' },
    { id: 'addons', label: 'Add-ons' },
    { id: 'media', label: 'Media & SEO' },
    { id: 'bookingRules', label: 'Booking Rules' },
    { id: 'resources', label: 'Resources' },
];

interface PackageBuilderModalProps {
    tour?: Tour | null;
    onClose: () => void;
    onSaved: () => void;
}

export function PackageBuilderModal({ tour, onClose, onSaved }: PackageBuilderModalProps) {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<TabId>('basic');
    const [localId, setLocalId] = useState<string | null>(tour?._id ?? null);

    useEffect(() => {
        setLocalId(tour?._id ?? null);
    }, [tour]);

    const { data: fullDoc, isLoading } = useQuery({
        queryKey: ['admin-package', localId],
        queryFn: () => adminPackagesApi.getById(localId!),
        enabled: !!localId,
    });

    const detail = (fullDoc || {}) as Record<string, any>;

    const createMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) => adminPackagesApi.create(payload),
        onSuccess: (data: any) => {
            const id = data?._id;
            if (id) setLocalId(String(id));
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
            queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
            onSaved();
        },
    });

    const patchMutation = useMutation({
        mutationFn: ({ section, payload }: { section: string; payload: Record<string, unknown> }) =>
            adminPackagesApi.patchSection(localId!, section, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
            queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
            queryClient.invalidateQueries({ queryKey: ['admin-package', localId] });
            onSaved();
        },
    });

    const [basic, setBasic] = useState({
        title: '',
        packageCode: '',
        slug: '',
        shortDescription: '',
        fullDescription: '',
        category: '',
        tourType: 'cultural',
        status: 'published',
        description: '',
    });

    const [route, setRoute] = useState({
        days: 1,
        nights: 0,
        destinationsText: '',
        startLocation: '',
        endLocation: '',
        destination: '',
    });

    const [itinText, setItinText] = useState('[]');

    const [pricing, setPricing] = useState({
        basePrice: 0,
        price: 0,
        pricingType: 'per_person',
        depositPercent: 20,
    });

    const [avail, setAvail] = useState({
        minGuests: 1,
        maxGuests: 20,
        departureType: 'on_request',
        bookingCutoffHours: 24,
    });

    const [incl, setIncl] = useState({ includedText: '', excludedText: '', highlightsText: '' });

    const [addonsText, setAddonsText] = useState('[]');

    const [media, setMedia] = useState({
        coverImage: '',
        galleryText: '',
        metaTitle: '',
        metaDescription: '',
    });

    const [bookingRules, setBookingRules] = useState({
        cancellationPolicy: '',
        childDiscountRules: '',
    });

    const [resources, setResources] = useState({
        guideRequired: false,
        vehicleRequired: true,
        hotelRequired: false,
    });

    useEffect(() => {
        if (!detail || !Object.keys(detail).length) return;
        setBasic({
            title: detail.title || '',
            packageCode: detail.packageCode || '',
            slug: detail.slug || '',
            shortDescription: detail.shortDescription || '',
            fullDescription: detail.fullDescription || '',
            category: detail.category || '',
            tourType: detail.tourType || 'cultural',
            status: detail.status || 'published',
            description: detail.description || '',
        });
        const days = detail.duration?.days ?? detail.duration ?? 1;
        const dNum = typeof days === 'number' ? days : parseInt(String(days).replace(/\D/g, ''), 10) || 1;
        setRoute({
            days: dNum,
            nights: detail.duration?.nights ?? Math.max(0, dNum - 1),
            destinationsText: Array.isArray(detail.destinations) ? detail.destinations.join(', ') : detail.destination || '',
            startLocation: detail.startLocation || '',
            endLocation: detail.endLocation || '',
            destination: detail.destination || '',
        });
        setItinText(JSON.stringify(detail.itinerary || [], null, 2));
        setPricing({
            basePrice: detail.basePrice ?? detail.price ?? 0,
            price: detail.price ?? detail.basePrice ?? 0,
            pricingType: detail.pricingType || 'per_person',
            depositPercent: detail.depositPercent ?? 20,
        });
        setAvail({
            minGuests: detail.minGuests ?? 1,
            maxGuests: detail.maxGuests ?? 20,
            departureType: detail.departureType || 'on_request',
            bookingCutoffHours: detail.bookingCutoffHours ?? 24,
        });
        const inc = detail.included || [];
        const exc = detail.excluded || [];
        const hi = detail.highlights || [];
        setIncl({
            includedText: Array.isArray(inc) ? inc.join('\n') : '',
            excludedText: Array.isArray(exc) ? exc.join('\n') : '',
            highlightsText: Array.isArray(hi) ? hi.join('\n') : '',
        });
        setAddonsText(JSON.stringify(detail.addons || [], null, 2));
        const gall = detail.gallery || detail.images || detail.imageUrl || [];
        setMedia({
            coverImage: detail.coverImage || '',
            galleryText: Array.isArray(gall) ? gall.join('\n') : '',
            metaTitle: detail.metaTitle || '',
            metaDescription: detail.metaDescription || '',
        });
        setBookingRules({
            cancellationPolicy: detail.cancellationPolicy || '',
            childDiscountRules: detail.childDiscountRules || '',
        });
        setResources({
            guideRequired: !!detail.guideRequired,
            vehicleRequired: detail.vehicleRequired !== false,
            hotelRequired: !!detail.hotelRequired,
        });
    }, [fullDoc]);

    const splitLines = (t: string) =>
        t
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

    const saveTab = async () => {
        if (!localId) {
            await createMutation.mutateAsync({
                title: basic.title || 'Untitled package',
                description: basic.description || basic.fullDescription || 'Description pending',
                shortDescription: basic.shortDescription,
                fullDescription: basic.fullDescription || basic.description,
                category: basic.category,
                tourType: basic.tourType,
                status: basic.status,
                packageCode: basic.packageCode || undefined,
                slug: basic.slug || undefined,
                destination: route.destination || route.destinationsText.split(',')[0]?.trim(),
                destinations: route.destinationsText.split(',').map((s) => s.trim()).filter(Boolean),
                duration: { days: route.days, nights: route.nights },
                price: pricing.price,
                basePrice: pricing.basePrice || pricing.price,
                maxGuests: avail.maxGuests,
                featured: false,
            });
            return;
        }

        let parsedItinerary: unknown[] = [];
        let parsedAddons: unknown[] = [];
        try {
            parsedItinerary = JSON.parse(itinText || '[]') as unknown[];
        } catch {
            throw new Error('Itinerary must be valid JSON array');
        }
        try {
            parsedAddons = JSON.parse(addonsText || '[]') as unknown[];
        } catch {
            throw new Error('Add-ons must be valid JSON array');
        }

        const payloads: Record<TabId, Record<string, unknown>> = {
            basic: {
                packageCode: basic.packageCode || undefined,
                title: basic.title,
                slug: basic.slug || undefined,
                shortDescription: basic.shortDescription,
                fullDescription: basic.fullDescription || basic.description,
                category: basic.category,
                tourType: basic.tourType,
                status: basic.status,
                description: basic.description,
            },
            route: {
                duration: { days: route.days, nights: route.nights },
                destinations: route.destinationsText.split(',').map((s) => s.trim()).filter(Boolean),
                startLocation: route.startLocation,
                endLocation: route.endLocation,
                destination: route.destination || route.destinationsText.split(',')[0]?.trim(),
            },
            itinerary: { itinerary: parsedItinerary },
            pricing: {
                basePrice: pricing.basePrice,
                price: pricing.price,
                pricingType: pricing.pricingType,
                depositPercent: pricing.depositPercent,
            },
            availability: {
                minGuests: avail.minGuests,
                maxGuests: avail.maxGuests,
                departureType: avail.departureType,
                bookingCutoffHours: avail.bookingCutoffHours,
            },
            inclusions: {
                included: splitLines(incl.includedText),
                excluded: splitLines(incl.excludedText),
                highlights: splitLines(incl.highlightsText),
            },
            addons: { addons: parsedAddons },
            media: {
                coverImage: media.coverImage,
                gallery: splitLines(media.galleryText),
                images: splitLines(media.galleryText),
                metaTitle: media.metaTitle,
                metaDescription: media.metaDescription,
            },
            bookingRules: {
                depositPercent: pricing.depositPercent,
                cancellationPolicy: bookingRules.cancellationPolicy,
                childDiscountRules: bookingRules.childDiscountRules,
            },
            resources: {
                guideRequired: resources.guideRequired,
                vehicleRequired: resources.vehicleRequired,
                hotelRequired: resources.hotelRequired,
            },
        };

        await patchMutation.mutateAsync({ section: tab, payload: payloads[tab] });
    };

    const busy = createMutation.isPending || patchMutation.isPending || isLoading;

    const tabHint = useMemo(() => {
        if (localId) return null;
        if (tab !== 'basic') return 'Save Basic Info first to create the package.';
        return null;
    }, [localId, tab]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-surface-light border border-surface-border w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
                <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold">{localId ? 'Package Builder' : 'New Package'}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Section saves use PATCH — enterprise fields stored on the tour package document.
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-surface-dark rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0">
                    <nav className="w-52 shrink-0 border-r border-surface-border p-3 space-y-1 overflow-y-auto bg-surface-dark/20">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    tab === t.id ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-surface-dark text-muted-foreground'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {tabHint && <p className="text-sm text-amber-400">{tabHint}</p>}
                        {tab === 'basic' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Title">
                                    <Input value={basic.title} onChange={(e) => setBasic({ ...basic, title: e.target.value })} />
                                </Field>
                                <Field label="Package code">
                                    <Input value={basic.packageCode} onChange={(e) => setBasic({ ...basic, packageCode: e.target.value })} />
                                </Field>
                                <Field label="Slug">
                                    <Input value={basic.slug} onChange={(e) => setBasic({ ...basic, slug: e.target.value })} />
                                </Field>
                                <Field label="Category">
                                    <Input value={basic.category} onChange={(e) => setBasic({ ...basic, category: e.target.value })} />
                                </Field>
                                <Field label="Tour type">
                                    <AccessibleSelect
                                        value={basic.tourType}
                                        onChange={(v) => setBasic({ ...basic, tourType: v })}
                                        options={[
                                            { value: 'cultural', label: 'cultural' },
                                            { value: 'adventure', label: 'adventure' },
                                            { value: 'historical', label: 'historical' },
                                            { value: 'trekking', label: 'trekking' },
                                            { value: 'wildlife', label: 'wildlife' },
                                            { value: 'photography', label: 'photography' },
                                            { value: 'mixed', label: 'mixed' },
                                        ]}
                                    />
                                </Field>
                                <Field label="Status">
                                    <AccessibleSelect
                                        value={basic.status}
                                        onChange={(v) => setBasic({ ...basic, status: v })}
                                        options={[
                                            { value: 'draft', label: 'draft' },
                                            { value: 'published', label: 'published' },
                                            { value: 'archived', label: 'archived' },
                                        ]}
                                    />
                                </Field>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Short description</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[72px] text-white"
                                        value={basic.shortDescription}
                                        onChange={(e) => setBasic({ ...basic, shortDescription: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Full description</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[120px] text-white"
                                        value={basic.fullDescription || basic.description}
                                        onChange={(e) => setBasic({ ...basic, fullDescription: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {tab === 'route' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Days">
                                    <Input
                                        type="number"
                                        value={route.days}
                                        onChange={(e) => setRoute({ ...route, days: Number(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Nights">
                                    <Input
                                        type="number"
                                        value={route.nights}
                                        onChange={(e) => setRoute({ ...route, nights: Number(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Destinations (comma-separated)">
                                    <Input
                                        value={route.destinationsText}
                                        onChange={(e) => setRoute({ ...route, destinationsText: e.target.value })}
                                    />
                                </Field>
                                <Field label="Legacy single destination">
                                    <Input value={route.destination} onChange={(e) => setRoute({ ...route, destination: e.target.value })} />
                                </Field>
                                <Field label="Start location">
                                    <Input value={route.startLocation} onChange={(e) => setRoute({ ...route, startLocation: e.target.value })} />
                                </Field>
                                <Field label="End location">
                                    <Input value={route.endLocation} onChange={(e) => setRoute({ ...route, endLocation: e.target.value })} />
                                </Field>
                            </div>
                        )}

                        {tab === 'itinerary' && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">JSON array of itinerary days (advanced). Example: day, title, activities.</p>
                                <textarea
                                    className="w-full font-mono text-sm p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[280px] text-white"
                                    value={itinText}
                                    onChange={(e) => setItinText(e.target.value)}
                                />
                            </div>
                        )}

                        {tab === 'pricing' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Base price">
                                    <Input
                                        type="number"
                                        value={pricing.basePrice}
                                        onChange={(e) => setPricing({ ...pricing, basePrice: Number(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Legacy price mirror">
                                    <Input
                                        type="number"
                                        value={pricing.price}
                                        onChange={(e) => setPricing({ ...pricing, price: Number(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Pricing type">
                                    <AccessibleSelect
                                        value={pricing.pricingType}
                                        onChange={(v) => setPricing({ ...pricing, pricingType: v })}
                                        options={[
                                            { value: 'per_person', label: 'per_person' },
                                            { value: 'fixed_group', label: 'fixed_group' },
                                            { value: 'hybrid', label: 'hybrid' },
                                        ]}
                                    />
                                </Field>
                                <Field label="Deposit %">
                                    <Input
                                        type="number"
                                        value={pricing.depositPercent}
                                        onChange={(e) => setPricing({ ...pricing, depositPercent: Number(e.target.value) })}
                                    />
                                </Field>
                            </div>
                        )}

                        {tab === 'availability' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Min guests">
                                    <Input
                                        type="number"
                                        value={avail.minGuests}
                                        onChange={(e) => setAvail({ ...avail, minGuests: Number(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Max guests">
                                    <Input
                                        type="number"
                                        value={avail.maxGuests}
                                        onChange={(e) => setAvail({ ...avail, maxGuests: Number(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Departure type">
                                    <AccessibleSelect
                                        value={avail.departureType}
                                        onChange={(v) => setAvail({ ...avail, departureType: v })}
                                        options={[
                                            { value: 'fixed_schedule', label: 'fixed_schedule' },
                                            { value: 'on_request', label: 'on_request' },
                                            { value: 'rolling', label: 'rolling' },
                                        ]}
                                    />
                                </Field>
                                <Field label="Booking cutoff (hours)">
                                    <Input
                                        type="number"
                                        value={avail.bookingCutoffHours}
                                        onChange={(e) => setAvail({ ...avail, bookingCutoffHours: Number(e.target.value) })}
                                    />
                                </Field>
                            </div>
                        )}

                        {tab === 'inclusions' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Included (one per line)</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[200px] text-white"
                                        value={incl.includedText}
                                        onChange={(e) => setIncl({ ...incl, includedText: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Excluded</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[200px] text-white"
                                        value={incl.excludedText}
                                        onChange={(e) => setIncl({ ...incl, excludedText: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Highlights</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[200px] text-white"
                                        value={incl.highlightsText}
                                        onChange={(e) => setIncl({ ...incl, highlightsText: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {tab === 'addons' && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">JSON array: {'{'} name, price, optional {'}'}</p>
                                <textarea
                                    className="w-full font-mono text-sm p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[220px] text-white"
                                    value={addonsText}
                                    onChange={(e) => setAddonsText(e.target.value)}
                                />
                            </div>
                        )}

                        {tab === 'media' && (
                            <div className="grid grid-cols-1 gap-4">
                                <Field label="Cover image URL">
                                    <Input value={media.coverImage} onChange={(e) => setMedia({ ...media, coverImage: e.target.value })} />
                                </Field>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Gallery URLs (one per line)</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[160px] text-white"
                                        value={media.galleryText}
                                        onChange={(e) => setMedia({ ...media, galleryText: e.target.value })}
                                    />
                                </div>
                                <Field label="Meta title">
                                    <Input value={media.metaTitle} onChange={(e) => setMedia({ ...media, metaTitle: e.target.value })} />
                                </Field>
                                <Field label="Meta description">
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[80px] text-white"
                                        value={media.metaDescription}
                                        onChange={(e) => setMedia({ ...media, metaDescription: e.target.value })}
                                    />
                                </Field>
                            </div>
                        )}

                        {tab === 'bookingRules' && (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Cancellation policy</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[120px] text-white"
                                        value={bookingRules.cancellationPolicy}
                                        onChange={(e) => setBookingRules({ ...bookingRules, cancellationPolicy: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Child discount rules</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[80px] text-white"
                                        value={bookingRules.childDiscountRules}
                                        onChange={(e) => setBookingRules({ ...bookingRules, childDiscountRules: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {tab === 'resources' && (
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={resources.guideRequired}
                                        onChange={(e) => setResources({ ...resources, guideRequired: e.target.checked })}
                                    />
                                    Guide required
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={resources.vehicleRequired}
                                        onChange={(e) => setResources({ ...resources, vehicleRequired: e.target.checked })}
                                    />
                                    Vehicle required
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={resources.hotelRequired}
                                        onChange={(e) => setResources({ ...resources, hotelRequired: e.target.checked })}
                                    />
                                    Hotel required
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-surface-border flex justify-end gap-3 shrink-0">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button type="button" className="gap-2" onClick={() => saveTab()} disabled={busy || !!tabHint}>
                        {busy ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
                        {localId ? 'Save section' : 'Create package'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-muted-foreground">{label}</label>
            {children}
        </div>
    );
}
