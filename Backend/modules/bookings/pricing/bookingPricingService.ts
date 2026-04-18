import type { Document } from 'mongoose';
import crypto from 'crypto';
import {
    calculatePackageQuote,
    PackageQuoteInput,
    PackageQuoteResult,
} from '../../packages/services/pricingService';
import type { IPricingSnapshot } from '../models/bookingSchema';

export interface AddonLineInput {
    addonKey?: string;
    name: string;
    quantity?: number;
}

export function buildAddonKey(packageId: string, addonName: string): string {
    return crypto.createHash('sha256').update(`${packageId}:${addonName}`).digest('hex').slice(0, 16);
}

export function buildTourPricingSnapshot(
    tour: Document | Record<string, any>,
    input: PackageQuoteInput & { selectedAddons?: AddonLineInput[] },
    packageIdStr: string
): {
    snapshot: IPricingSnapshot;
    quote: PackageQuoteResult;
    addOnLines: {
        addonKey: string;
        name: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
    }[];
} {
    const quote = calculatePackageQuote(tour, input);

    const addOnLines: {
        addonKey: string;
        name: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
    }[] = [];

    let addOnsTotal = 0;
    for (const line of quote.lines) {
        if (!line.label.startsWith('Add-on:')) continue;
        const name = line.label.replace(/^Add-on:\s*/i, '').trim();
        const amt = Number(line.amount) || 0;
        addOnsTotal += amt;
        addOnLines.push({
            addonKey: buildAddonKey(packageIdStr, name),
            name,
            unitPrice: amt,
            quantity: 1,
            lineTotal: amt,
        });
    }

    const baseGuestAmount = Math.max(0, quote.subtotal - addOnsTotal);

    const snapshot: IPricingSnapshot = {
        baseAmount: Math.round(baseGuestAmount * 100) / 100,
        groupDiscountAmount: 0,
        seasonalAdjustmentAmount: 0,
        addOnsTotal: Math.round(addOnsTotal * 100) / 100,
        subtotal: quote.subtotal,
        depositAmount: quote.deposit,
        totalAmount: quote.total,
        currency: quote.currency,
        lines: quote.lines,
        quotedAt: new Date(),
        guests: input.guests,
        children: input.children ?? 0,
        pricingType: quote.pricingType,
    };

    return { snapshot, quote, addOnLines };
}
