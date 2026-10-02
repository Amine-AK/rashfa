# Deploying Rashfa to Vercel Free Hosting with Neon DB (PostgreSQL)

This guide provides step-by-step instructions for deploying **Rashfa** to Vercel (100% free hosting) connected to **Neon.tech** free serverless PostgreSQL database.

---

## ⚡ Step 1: Create a Free Neon Database (1 minute)

1. Go to **[https://neon.tech](https://neon.tech)** and sign up for a free account.
2. Click **Create Project** and name it `rashfa-db`.
3. Choose your preferred region (e.g. Europe/Frankfurt).
4. Once created, copy the **PostgreSQL Connection String** (`DATABASE_URL`).
   - Example: `postgresql://amine_owner:secret_password@ep-cool-flower-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require`

---

## 🚀 Step 2: Deploy to Vercel (2 minutes)

1. Go to **[https://vercel.com](https://vercel.com)** and sign in with your GitHub account (`Amine-AK`).
2. Click **Add New...** -> **Project**.
3. Select your repository: **`Amine-AK/rashfa`**.
4. Configure Project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - Name: `VITE_DATABASE_URL`
   - Value: *(Paste your Neon Connection String from Step 1)*
6. Click **Deploy**.

---

## 🔄 Step 3: Cloud Sync & Backup Features

- **Local-First Speed**: Rashfa works instantly offline behind the counter using IndexedDB.
- **Neon Cloud Backup**: Click the **Cloud Icon (☁)** in the top header at any time (or enter your `VITE_DATABASE_URL`) to instantly sync all sales, drinks catalog, expenses, and closing records to your Neon PostgreSQL database!
