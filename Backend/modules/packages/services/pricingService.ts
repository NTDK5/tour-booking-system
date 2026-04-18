import type { Document } from 'mongoose';

export interface QuoteLine {
    label: string;
    amount: number;
}

export interface PackageQuoteInput {
    guests: number;
    children?: number;
    travelDate?: Date;
    selectedAddonNames?: string[];
}

export interface PackageQuoteResult {
    currency: string;
    lines: QuoteLine[];
    subtotal: number;
    discounts: number;
    deposit: number;
    total: number;
    pricingType: string;
}

const monthDayInWindow = (
    date: Date,
    startMonth: number,
    startDay: number,
    endMonth: number,
    endDay: number
): boolean => {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const md = m * 100 + d;
    const start = startMonth * 100 + startDay;
    const end = endMonth * 100 + endDay;
    if (start <= end) return md >= start && md <= end;
    return md >= start || md <= end;
};

/** Resolve numeric base price from legacy or enterprise fields */
export const getEffectiveBasePrice = (pkg: any): number => {
    if (pkg.basePrice != null && pkg.basePrice > 0) return Number(pkg.basePrice);
    if (pkg.price != null && pkg.price > 0) return Number(pkg.price);
    if (pkg.legacyPrice != null) return Number(pkg.legacyPrice);
    return 0;
};

export function calculatePackageQuote(pkg: Document | Record<string, any>, input: PackageQuoteInput): PackageQuoteResult {
    const p = pkg && typeof (pkg as Document).toObject === 'function' ? (pkg as Document).toObject() : pkg;
    const guests = Math.max(1, input.guests || 1);
    const children = Math.max(0, input.children || 0);
    const adults = Math.max(0, guests - children);

    const pricingType = p.pricingType || 'per_person';
    let unitPrice = getEffectiveBasePrice(p);
    const lines: QuoteLine[] = [];

    if (input.travelDate && Array.isArray(p.seasonalPricing)) {
        for (const rule of p.seasonalPricing) {
            if (
                rule?.startMonth &&
                monthDayInWindow(input.travelDate, rule.startMonth, rule.startDay || 1, rule.endMonth || 12, rule.endDay || 31)
            ) {
                if (rule.overrideBasePrice != null) unitPrice = Number(rule.overrideBasePrice);
                else if (rule.multiplier != null) unitPrice = unitPrice * Number(rule.multiplier);
                lines.push({
                    label: rule.name ? `Seasonal: ${rule.name}` : 'Seasonal adjustment',
                    amount: 0,
                });
                break;
            }
        }
    }

    let subtotal = 0;

    if (pricingType === 'per_person') {
        let adultTotal = adults * unitPrice;
        let childTotal = 0;
        const cp = p.childPolicy;
        if (cp && children > 0 && cp.discountPercent) {
            childTotal = children * unitPrice * (1 - Number(cp.discountPercent) / 100);
        } else {
            childTotal = children * unitPrice;
        }
        subtotal = adultTotal + childTotal;
        lines.unshift({
            label: `${guests} guest(s) (${pricingType.replace('_', ' ')})`,
            amount: subtotal,
        });
    } else if (pricingType === 'fixed_group') {
        const tiers = Array.isArray(p.groupPricing) ? [...p.groupPricing].sort((a: any, b: any) => (a.minGuests || 1) - (b.minGuests || 1)) : [];
        let applied = false;
        for (const tier of tiers) {
            const min = tier.minGuests || 1;
            const max = tier.maxGuests ?? 999;
            if (guests >= min && guests <= max) {
                if (tier.fixedPrice != null) {
                    subtotal = Number(tier.fixedPrice);
                    applied = true;
                    lines.unshift({ label: `Group tier (${min}-${max} guests)`, amount: subtotal });
                } else if (tier.pricePerPerson != null) {
                    subtotal = guests * Number(tier.pricePerPerson);
                    applied = true;
                    lines.unshift({ label: `Group tier per person`, amount: subtotal });
                }
                break;
            }
        }
        if (!applied) subtotal = guests * unitPrice;
        if (!lines.length) lines.unshift({ label: 'Package total', amount: subtotal });
    } else {
        subtotal = guests * unitPrice;
        lines.unshift({ label: `Hybrid pricing (${guests} guests)`, amount: subtotal });
    }

    let addonsTotal = 0;
    const addonNames = new Set(input.selectedAddonNames || []);
    if (Array.isArray(p.addons)) {
        for (const addon of p.addons) {
            if (addon.optional === false || addonNames.has(addon.name)) {
                addonsTotal += Number(addon.price || 0);
                lines.push({
                    label: `Add-on: ${addon.name}`,
                    amount: Number(addon.price || 0),
                });
            }
        }
    }

    subtotal += addonsTotal;
    const depositPct = typeof p.depositPercent === 'number' ? p.depositPercent : 20;
    const deposit = Math.round(((subtotal * depositPct) / 100) * 100) / 100;

    return {
        currency: 'USD',
        lines,
        subtotal: Math.round(subtotal * 100) / 100,
        discounts: 0,
        deposit,
        total: Math.round(subtotal * 100) / 100,
        pricingType,
    };
}
