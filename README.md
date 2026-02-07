# Civix - Waterlogging Reporter & Navigator

A full-stack app to report and navigate around waterlogged areas with real-time updates.

## Features

- 📍 View your current location on map
- 💧 Report waterlogged areas with severity (Low/Medium/High)
- 🗺️ See all reports on interactive Mapbox map
- 🔍 Search destinations with autocomplete
- 🧭 Navigate with routes that avoid waterlogged zones
- ⏰ Reports auto-expire after 4 hours
- 🔄 Real-time updates from backend

## Quick Start

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start backend:**
   ```bash
   python app/main.py
   ```
   Backend runs at http://localhost:8000

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start frontend:**
   ```bash
   npm start
   ```
   Frontend runs at http://localhost:3000

## How It Works

- Backend stores reports in JSON file
- Reports expire after 4 hours automatically
- Frontend polls backend every 30 seconds
- Search uses Mapbox Geocoding API
- Navigation uses Mapbox Directions API

## Tech Stack

- **Backend:** FastAPI, Python
- **Frontend:** React 18, Mapbox GL
- **Storage:** JSON file (simple & portable)

---

**Built for local civic awareness 🌧️**
