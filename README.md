# BzDashboard

BzDashboard is a Next.js web application that connects to your electric vehicle via the [Smartcar API](https://smartcar.com/) and displays real-time and historical data — battery level, charging status, odometer, location, charge sessions, and daily trip summaries.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Deploy to Render](#deploy-to-render)
- [Environment Variables](#environment-variables)
- [Using the App](#using-the-app)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [PostgreSQL](https://www.postgresql.org/) database
- A [Smartcar](https://smartcar.com/) developer account and application

---

## Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/arundamo/BzDashboard.git
   cd BzDashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

4. **Run database migrations**

   ```bash
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploy to Render

### 1. Create a PostgreSQL database on Render

1. Log in to [Render](https://render.com/) and click **New → PostgreSQL**.
2. Give it a name (e.g. `bzdashboard-db`) and choose a region.
3. Click **Create Database**.
4. Once it is ready, copy the **Internal Database URL** — you will need it in the next step.

### 2. Create a Web Service on Render

1. Click **New → Web Service** and connect your GitHub repository.
2. Configure the service with the following settings:

   | Setting | Value |
   |---|---|
   | **Runtime** | Node |
   | **Build Command** | `npm install && npx prisma generate && npx prisma db push && npm run build` |
   | **Start Command** | `npm run start` |

3. Under **Environment Variables**, add the variables listed in the [Environment Variables](#environment-variables) section below. Use the **Internal Database URL** from the previous step as `DATABASE_URL`.

4. Click **Create Web Service**. Render will build and deploy the app automatically.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:password@host:5432/dbname`) |
| `APP_SECRET` | A long, random secret string used to sign session tokens |
| `SMARTCAR_CLIENT_ID` | Client ID from your Smartcar application |
| `SMARTCAR_CLIENT_SECRET` | Client secret from your Smartcar application |
| `SMARTCAR_REDIRECT_URI` | OAuth callback URL — set to `https://<your-render-url>/api/smartcar/callback` |
| `NEXT_PUBLIC_APP_URL` | Public URL of your deployed app (e.g. `https://bzdashboard.onrender.com`) |

> **Tip:** You can generate a strong `APP_SECRET` with `openssl rand -hex 32`.

---

## Using the App

1. **Register / Log in** — Open the app URL in your browser and create an account, then log in.
2. **Connect a vehicle** — Go to **Settings → Connect Vehicle**. You will be redirected to Smartcar's OAuth flow. Grant permission for the vehicle you want to track.
3. **View the dashboard** — After connecting, the **Dashboard** page shows:
   - Current battery level and range
   - Charging status
   - Odometer reading
   - Vehicle location on a map
4. **Charge sessions** — The app automatically records each charge session and shows a history with start/end battery percentages and energy added.
5. **Trip summaries** — Daily driving distance is tracked and displayed as a chart.
6. **Disconnect a vehicle** — Go to **Settings** to remove a connected vehicle at any time.