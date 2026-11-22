# Xar Books

A marketplace for buying and selling used books. Sellers list books with photos; buyers browse, add to a cart or wishlist, and pay by card (Stripe) or cash on delivery.

## Features

- Sign up with email verification, log in, reset a forgotten password
- Browse books with search, filters, sort and pagination (all kept in the URL)
- Book pages with photos, seller and price details
- Cart, wishlist and checkout (card through Stripe Checkout, or cash on delivery)
- Sellers: list, edit and remove books; mark sales as shipped; reject cash-on-delivery orders
- Buyers: track orders, pay pending card orders, cancel before shipping, confirm when books arrive
- Profile with avatar upload and password change

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Redux Toolkit + RTK Query · MongoDB with Mongoose · Stripe · Cloudinary · Nodemailer · Vitest

## Getting started

You need Node.js 22 or newer and a MongoDB database (local or Atlas).

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Name | What it is |
| --- | --- |
| `FRONTEND_URL` | The site's public URL, used in emails and Stripe redirects (`http://localhost:3000` locally) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | A long random string for signing login cookies |
| `EMAIL_USER`, `EMAIL_PASS` | The mailbox that sends verification and reset emails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image hosting for book photos and avatars |
| `STRIPE_SECRET_KEY` | Stripe secret key (use a test key locally) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook |

Never commit `.env.local`.

### Stripe webhook (local)

Card payments are confirmed by a webhook. With the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Put the `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Project structure

```
src/
  app/              pages, layouts and components
    api/            route handlers, one thin route.ts per endpoint
  server/
    config/         database and Cloudinary setup
    models/         Mongoose models
    controllers/    request logic for each area (auth, products, orders...)
    utils/          shared server helpers (auth, validation, uploads, errors)
  store/            Redux store, RTK Query API, slices
  lib/              shared client helpers
tests/              unit tests
```

Each `route.ts` just wraps a controller with `handle()`, which turns thrown `AppError`s into JSON error responses.

## Order flow

1. The buyer checks out. Card orders go to Stripe and are marked paid by the webhook; cash-on-delivery orders start as pending.
2. Each seller marks their books as shipped.
3. Once every book in the order has shipped, the buyer confirms it arrived. The order becomes delivered, and cash-on-delivery orders become paid.

A buyer can cancel while nothing has shipped (card orders are refunded). A seller can reject a cash-on-delivery order before shipping.
