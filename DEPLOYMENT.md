# Tiimo Production Cloud Architecture & Deployment Guide

This guide details the complete end-to-end deployment of the Tiimo-style visual planner application, covering the frontend (Vite React SPA) on Vercel and the backend REST API (Node.js/Express + MongoDB) on Render or Railway.

---

## 1. Architecture Overview

```
                      +-----------------------------+
                      |   Client: Mobile & Web      |
                      |   Vercel / iOS / Android    |
                      +--------------+--------------+
                                     |
                         HTTPS / Authorization: Bearer
                                     |
                      +--------------v--------------+
                      |  Express REST API Gateway   |
                      |  (Render / Railway)         |
                      |  - Rate Limiting            |
                      |  - JWT & Cookie Auth        |
                      |  - Error Handling           |
                      +-------+--------------+------+
                              |              |
           +------------------+              +-------------------+
           |                                                     |
+----------v-----------+                             +-----------v-----------+
|   MongoDB Atlas      |                             |   Stripe Webhooks     |
|   - Users & Sessions |                             |   - Customer Checkout |
|   - Tasks & Routines |                             |   - Pro Subscription  |
|   - Mood & Streaks   |                             |   - Invoice Renewals  |
+----------------------+                             +-----------------------+
```

---

## 2. Step 1: Database Setup (MongoDB Atlas)

1. Sign up / Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** or production **M10+** cluster.
3. Under **Database Access**, create a database user:
   - Username: `tiimo_admin`
   - Password: `<secure-password>`
   - Role: `Read and write to any database`
4. Under **Network Access**, add an IP Access entry:
   - Set to `0.0.0.0/0` (Allow Access from Anywhere for Render/Railway).
5. Click **Connect** -> **Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://tiimo_admin:<password>@cluster0.mongodb.net/tiimo_cloud_db?retryWrites=true&w=majority
   ```

---

## 3. Step 2: Backend Deployment (Render or Railway)

### Option A: Render (Web Service)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`Tiimo`).
4. Configure service settings:
   - **Name**: `tiimo-backend-api`
   - **Region**: Closest to your users (e.g., Frankfurt, Oregon, Singapore)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Configure Environment Variables in Render:
   | Key | Example Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://...` |
   | `JWT_SECRET` | `64_char_secure_random_string` |
   | `COOKIE_SECRET` | `32_char_secure_random_string` |
   | `CLIENT_URL` | `https://your-tiimo-frontend.vercel.app` |
   | `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` |
   | `STRIPE_SECRET_KEY` | `sk_live_...` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
   | `STRIPE_PRICE_MONTHLY` | `price_...` |
   | `STRIPE_PRICE_YEARLY` | `price_...` |
6. Deploy service. Copy your public service URL (e.g., `https://tiimo-backend-api.onrender.com`).

---

## 4. Step 3: Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`Tiimo`).
4. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (Leave default root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   ```
   VITE_API_URL=https://tiimo-backend-api.onrender.com/api
   ```
6. Click **Deploy**. Vercel will build and assign your production domain.

---

## 5. Step 4: Stripe Webhook Configuration

1. In [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
2. Click **Add Endpoint**.
3. **Endpoint URL**: `https://tiimo-backend-api.onrender.com/api/subscription/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **Add Endpoint** and reveal the **Signing Secret** (`whsec_...`).
6. Paste this value into your backend environment variable `STRIPE_WEBHOOK_SECRET`.

---

## 6. Verification Checklist

- [x] `GET /api/health` returns status `healthy` with server uptime.
- [x] `POST /api/auth/register` creates user with bcrypt hashed password.
- [x] `POST /api/auth/login` issues signed JWT token and sets HTTP-only cookie.
- [x] `POST /api/auth/google` validates Google credentials and upserts user.
- [x] `GET /api/tasks?date=YYYY-MM-DD` queries tasks matching authenticated `userId` and date.
- [x] `POST /api/subscription/webhook` handles Stripe subscription events.
- [x] Mobile responsive UI defaults directly to Tiimo planner with 1-tap Light/Dark toggle.
