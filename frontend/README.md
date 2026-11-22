# Wayfare frontend

The React frontend is built with Vite.

## Run locally

```bash
npm install
npm start
```

The development server runs at [http://localhost:3000](http://localhost:3000).

## Verify and build

```bash
npm test -- --watchAll=false
npm run build
```

The booking flow uses three steps: route search, seat selection, and Razorpay test checkout. The backend creates orders using server-calculated fares and verifies the Razorpay payment signature before issuing the ticket. Configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on the backend using Razorpay test keys; never put the secret in frontend environment variables.

The sample bus and seat data are not live inventory, and successful test payments do not charge real money. In production, the frontend and API are served from the same origin; set `VITE_API_BASE_URL` only when deploying them separately.
