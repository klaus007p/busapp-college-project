# Wayfare

Wayfare is a React/Vite and Express bus-booking college project with sign-in, route search, seat selection, passenger details, Razorpay test checkout, and a printable ticket.

The bus, route, and seat data are samples, not live transport inventory. Checkout is restricted to Razorpay **test mode**; successful test payments do not charge real money. Passport.js handles user authentication; Razorpay handles payments.

## Local development

Use Node.js 22.12 or newer and a MongoDB database. Install the backend and frontend dependencies:

```bash
npm ci --prefix backend
npm ci --prefix frontend
```

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, a strong `JWT_SECRET`, `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from Razorpay's **test mode**, and `RAZORPAY_MODE=test`. Never commit `.env` files or place the Razorpay secret in frontend code.

Run the backend and frontend in separate terminals:

```bash
npm start --prefix backend
npm start --prefix frontend
```

The API uses port 8080 locally and Vite uses port 3000. Run checks with:

```bash
npm test --prefix backend
npm test --prefix frontend -- --watchAll=false
npm run build --prefix frontend
```

## Railway

The repository is configured as one Railway service: the root build creates the Vite frontend and Express serves it with the API. Connect the repository root to Railway. Set these service variables in Railway's dashboard:

- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `RAZORPAY_MODE=test`
- `RAZORPAY_KEY_ID` (must start with `rzp_test_`)
- `RAZORPAY_KEY_SECRET`

Railway supplies `PORT`; `/health` is the configured readiness check. The frontend and API share an origin, so no frontend API URL variable is needed.

Rotate the database credentials that were previously present in project configuration before deployment. Live Razorpay payments are intentionally disabled for this project.
