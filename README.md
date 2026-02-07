# TowMe 2.0 - Roadside Assistance Platform

TowMe 2.0 is a modern, professional, and end-to-end roadside assistance ecosystem built with React (Vite) and Node.js.

## 🚀 One-Click Deployment

### 1. Backend (Server)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Hafidmuhsin/towme2.0)

**Note:** After clicking deployment, make sure to add your `MONGO_URI` and `JWT_SECRET` in the Environment Variables section of the Render dashboard.

### 2. Frontend (Client)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hafidmuhsin/towme2.0&root-directory=client)

**Note:** Ensure you add the `VITE_API_URL` variable pointing to your deployed Render backend.

---

## 🛠 Features

- **Professional UI**: Clean, minimal, and premium slate/blue aesthetic.
- **End-to-End Workflow**: Request -> Accept -> Progress -> Complete -> Pay.
- **Real-time Updates**: Powered by Socket.io for live job status tracking.
- **Interactive Maps**: Full Leaflet integration for location-based services.

## 📂 Project Structure

- `/client`: React + Vite + Tailwind CSS + Framer Motion.
- `/server`: Node.js + Express + MongoDB + Socket.io.

## 🏁 Setup & Deployment Guide

### Step 1: Database (MongoDB Atlas)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Create a new cluster and database named `towme`.
3. Go to **Network Access** and allow access from `0.0.0.0/0`.
4. Copy your connection string.

### Step 2: Backend Deployment
1. Click the **Deploy to Render** button above.
2. In the Render Dashboard, go to **Environment Variables**.
3. Add `MONGO_URI` (your Atlas string).
4. Add `JWT_SECRET` (any secure random string).
5. Copy your Render site URL.

### Step 3: Frontend Deployment
1. Click the **Deploy with Vercel** button above.
2. Add your **Environment Variable**:
   - `VITE_API_URL`: Your Render backend URL.
3. Your site is now live!

## 📜 License
This project is for demonstration purposes.
