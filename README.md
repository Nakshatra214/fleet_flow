# FleetFlow 🚛 — Smart Fleet Management System

A modern, full-stack Fleet Management System built for hackathons.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Chart.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB

## Features
- 🔐 Role-based login (Manager / Dispatcher / Driver)
- 🚗 Vehicle management with status tracking
- 👤 Driver management with license expiry warnings
- 📦 Trip assignment with cargo capacity validation
- 🔧 Maintenance logging with auto vehicle status update
- ⛽ Fuel & expense logging with auto cost calculation
- 📊 Analytics dashboard with ROI and fuel efficiency charts
- 📄 CSV export for reports

## Quick Start

### 1. Backend
```bash
cd backend
npm install
# Create .env (already created with defaults)
npm run seed    # Seed demo data
npm run dev     # Start on port 5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev     # Start on port 5173
```

### 3. Open App
Visit: http://localhost:5173

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Manager | manager@fleetflow.com | manager123 |
| Dispatcher | dispatcher@fleetflow.com | dispatch123 |
| Driver | driver@fleetflow.com | driver123 |

## Key Business Logic
- Cargo weight > vehicle capacity → trip blocked ❌
- Expired driver license → trip blocked ❌
- Trip completed → vehicle auto set to Available ✅
- Maintenance added → vehicle auto set to In Shop 🔧
- Maintenance completed → vehicle auto set to Available ✅
- Passwords hashed with bcrypt 🔒
- All routes protected with JWT 🛡️

## Project Structure
```
fleet_flow/
├── backend/
│   ├── models/       # User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog
│   ├── routes/       # auth, vehicles, drivers, trips, maintenance, fuel, analytics
│   ├── middleware/   # JWT auth middleware
│   ├── server.js
│   └── seed.js
└── frontend/
    └── src/
        ├── pages/    # Login, Dashboard, Vehicles, Drivers, Trips, Maintenance, FuelExpenses, Analytics
        ├── components/ # Layout (sidebar)
        ├── context/  # AuthContext
        └── api/      # Axios instance
```
