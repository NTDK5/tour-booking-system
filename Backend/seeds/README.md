# Dorze Tours — production-grade database seed

This suite loads **six flagship Ethiopian tour packages**, **eighteen departures**, **lodges**, **fleet vehicles**, **unified resource records** (including professional guide profiles), **one enterprise admin**, **six international traveler accounts**, and **eight sample bookings** (pending, confirmed, cancelled) with **server-aligned pricing snapshots**.

## Prerequisites

- MongoDB reachable via `MONGO_URI` in `Backend/.env`
- Dependencies installed (`npm install` in `Backend/`)

## Commands

From the `Backend/` directory:

```bash
npm run seed
```

Re-run after wiping or when you intentionally want to replace seeded content:

```bash
npm run seed:force
```

`--force` deletes existing rows in seeded collections (`Booking`, `PackageDeparture`, `Tour`, `Resource`, `Car`, `Lodge`, and users whose emails appear in the seed list) before inserting fresh data.

## Environment overrides

| Variable | Purpose | Default |
|----------|---------|---------|
| `SEED_ADMIN_PASSWORD` | Password for the admin account | `DorzeAdmin2026!` |
| `SEED_CUSTOMER_PASSWORD` | Password for all six traveler demo accounts | `DorzeTraveler2026!` |

## Admin credentials (after `npm run seed`)

- **Email:** `admin@system.com`
- **Password:** value of `SEED_ADMIN_PASSWORD`, or `DorzeAdmin2026!` if unset

The admin user includes **full package-management permission keys** on the `permissions` array, **`role: admin`**, **`status: active`**, and **`verified: true`**.

## Traveler demo accounts

All use the same password (`SEED_CUSTOMER_PASSWORD` / default above):

- `claire.delgado@travelers.co.uk`
- `marcus.wei@example.com`
- `isabelle.fontaine@voyage.fr`
- `jonas.odegard@fjordmail.no`
- `priya.narayan@nomadlabs.in`
- `ethan.brooks@urbanfield.us`

## What gets seeded

| Module | Files |
|--------|--------|
| Admin & travelers | `seeders/adminSeeder.ts`, `seeders/customerSeeder.ts` |
| Lodges, cars, guides | `seeders/resourceSeeder.ts` |
| Packages | `data/definitions/*.ts`, `seeders/packageSeeder.ts` |
| Departures | `seeders/departureSeeder.ts` |
| Bookings | `seeders/bookingSeeder.ts` |

Bookings use **`calculatePackageQuote`** so **line items, totals, and deposits** match the live pricing engine.

## Safety

- If **any tour documents** already exist, `npm run seed` **exits without changes** (prevents duplicate slugs). Use **`npm run seed:force`** only when you intend to reset seeded data.
