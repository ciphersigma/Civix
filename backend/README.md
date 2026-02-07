# Civix Backend API

Complete REST API for Civix mobile app with waterlogging reports, navigation, and user management.

## Features

✅ User registration & authentication (JWT)
✅ Report CRUD operations with photo upload
✅ Vote & verify reports
✅ Smart route calculation avoiding hazards
✅ Proximity alerts for nearby waterlogging
✅ Place search with Mapbox
✅ Statistics & analytics
✅ Auto-expiring reports (4 hours)
✅ Image compression & optimization

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `.env` file:
```
SECRET_KEY=your-secret-key
MAPBOX_TOKEN=your-mapbox-token
PORT=8000
```

### 3. Run Server

```bash
python app/main.py
```

Server runs at: **http://localhost:8000**

## API Endpoints

### Base URL: `/api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/users/register` | Register/login user | ❌ |
| GET | `/users/me` | Get user profile | ✅ |
| PUT | `/users/me` | Update profile | ✅ |
| GET | `/reports` | Get all reports | ❌ |
| GET | `/reports/:id` | Get single report | ❌ |
| POST | `/reports` | Create report | ✅ |
| DELETE | `/reports/:id` | Delete report | ✅ |
| POST | `/reports/:id/vote` | Vote on report | ✅ |
| POST | `/reports/:id/verify` | Verify report | ✅ |
| POST | `/routes` | Get safe route | ❌ |
| POST | `/alerts/check` | Check nearby hazards | ❌ |
| POST | `/upload` | Upload photo | ❌ |
| GET | `/search` | Search places | ❌ |
| GET | `/stats` | Get statistics | ❌ |

## Authentication

Protected endpoints require JWT token:

```
Authorization: Bearer <token>
```

Get token from `/users/register` endpoint.

## Testing

### Using Postman

Import `Civix_API.postman_collection.json` into Postman.

### Using cURL

```bash
# Register user
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test123", "name": "Test User"}'

# Get reports
curl http://localhost:8000/api/reports?lat=23.0225&lng=72.5714

# Create report (with token)
curl -X POST http://localhost:8000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 23.0225, "longitude": 72.5714, "severity": "HIGH", "depth": "KNEE"}'
```

## Data Storage

- **reports.json** - All waterlogging reports
- **users.json** - User accounts
- **votes.json** - Report votes
- **uploads/** - Uploaded photos

## Project Structure

```
backend/
├── app/
│   ├── routes/
│   │   ├── reports.py      # Report management
│   │   ├── users.py         # User management
│   │   ├── navigation.py    # Routes & alerts
│   │   ├── upload.py        # Photo upload & search
│   │   └── stats.py         # Statistics
│   ├── utils/
│   │   ├── auth.py          # JWT authentication
│   │   └── helpers.py       # Helper functions
│   └── main.py              # Flask app
├── uploads/                 # Photo storage
├── requirements.txt
├── .env
└── API_DOCUMENTATION.md
```

## For Flutter Developers

Complete API documentation: **API_DOCUMENTATION.md**

Key points:
- All responses are JSON
- Timestamps in ISO 8601 format
- Coordinates: latitude/longitude (decimal degrees)
- Distance in meters, duration in seconds
- Photos: base64 or multipart/form-data

## Production Deployment

1. Change `SECRET_KEY` in `.env`
2. Use production WSGI server (gunicorn):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
   ```
3. Set up reverse proxy (nginx)
4. Enable HTTPS
5. Use proper database (PostgreSQL)

## License

MIT
