# TOWME - Implementation Plan

## Project Overview
**TOWME** is a premium, production-grade Road Side Assistance (RSA) platform built on the MERN stack. It features real-time location tracking, role-based access control (RBAC), secure payments, and a luxury minimal UI design.

## Tech Stack
-   **Frontend**: React (Vite), Tailwind CSS, ShadCN UI, Framer Motion, Redux Toolkit, React Query.
-   **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.IO, JWT.
-   **Services**: Cloudinary (Media), Nodemailer (Email), Razorpay/Stripe (Payments), Google Maps/Mapbox (Location).

## Phases

### Phase 1: Foundation & Architecture
- [ ] **Project Setup**: Initialize monorepo structure (`client`, `server`).
- [ ] **Backend Config**: Setup Express server, MongoDB connection, Environment variables, Error handling middleware.
- [ ] **Frontend Config**: Setup React/Vite, Tailwind CSS, customized theme (Luxury Minimal), Redux Store.
- [ ] **Database Schema**: Define User, Provider, ServiceRequest, Vehicle, Review schemas with GeoJSON support.

### Phase 2: Authentication & Roles (RBAC)
- [ ] **Backend Auth**: Implement JWT Access/Refresh tokens, Password hashing (bcrypt), OTP Stub.
- [ ] **Frontend Auth**: Login/Register forms with Zod validation.
- [ ] **Provider Onboarding**: Document upload (Cloudinary), Admin verification workflow.
- [ ] **RBAC Middleware**: Protect routes for Customer, Provider, Admin.

### Phase 3: Service Request & Maps (The Core)
- [ ] **Map Integration**: Integrate Google Maps/Mapbox on frontend.
- [ ] **Location Services**: Implement provider location tracking and user location selection.
- [ ] **Matching Logic**: Backend GeoJSON query (`$near`) to find providers within 10km.
- [ ] **Socket.IO Setup**: Real-time event handling (`request_service`, `accept_service`, `location_update`).

### Phase 4: Service Flow & Real-time Tracking
- [ ] **Request Broadcast**: Notify nearby providers of new requests.
- [ ] **Booking Flow**: Accept/Reject logic, navigation to user, status updates (En Route, Arrived, Completed).
- [ ] **Live Tracking**: Real-time marker updates on map for Customer/Admin.
- [ ] **Chat/Call**: Basic communication features.

### Phase 5: Payments & Wallet
- [ ] **Payment Gateway**: Integrate Razorpay/Stripe for transactions.
- [ ] **Dynamic Pricing**: Calculate cost based on distance and service type.
- [ ] **Wallet System**: Provider earnings, Platform commission, Payout logic.

### Phase 6: Admin Dashboard
- [ ] **Overview**: Stats on active services, revenue, users.
- [ ] **User Management**: Approve/Ban providers, View documents.
- [ ] **Configs**: Set base prices, commission rates, service radius.

### Phase 7: Polish & Optimization
- [ ] **UI Polish**: Glassmorphism effects, 3D hover interactions, Smooth transitions (Framer Motion).
- [ ] **PWA**: Configure manifest and service workers.
- [ ] **Security**: Rate limiting, Helmet, Input sanitization.
- [ ] **Documentation**: API docs (Swagger), Setup guide.

## Directory Structure
```
/client (Frontend)
  /src
    /assets
    /components (UI, Shared)
    /features (Redux Slices)
    /hooks
    /pages (Customer, Provider, Admin)
    /services (API Integration)
    /utils
/server (Backend)
  /src
    /config
    /controllers
    /middleware
    /models
    /routes
    /services
    /utils
```
