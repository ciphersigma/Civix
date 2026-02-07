# Civix Backend API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
Protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. User Management

#### Register/Login User
```http
POST /api/users/register
Content-Type: application/json

{
  "deviceId": "unique_device_id",
  "name": "John Doe",
  "phone": "+919876543210",
  "fcmToken": "firebase_token"
}

Response: 200/201
{
  "userId": "user_1234567890",
  "token": "jwt_token_here",
  "createdAt": "2024-01-15T10:00:00"
}
```

#### Get User Profile
```http
GET /api/users/me
Authorization: Bearer <token>

Response: 200
{
  "userId": "user_1234567890",
  "name": "John Doe",
  "phone": "+919876543210",
  "reportsCount": 15,
  "joinedAt": "2024-01-15T10:00:00"
}
```

#### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+919876543210",
  "fcmToken": "new_token"
}

Response: 200
{
  "message": "Profile updated successfully"
}
```

---

### 2. Reports Management

#### Get All Reports
```http
GET /api/reports?lat=23.0225&lng=72.5714&radius=5000

Response: 200
[
  {
    "id": 1234567890,
    "latitude": 23.0225,
    "longitude": 72.5714,
    "severity": "HIGH",
    "depth": "KNEE",
    "photoUrl": "/uploads/photo123.jpg",
    "description": "Heavy waterlogging",
    "userId": "user_123",
    "votes": 5,
    "createdAt": "2024-01-15T10:30:00",
    "expiresAt": "2024-01-15T14:30:00",
    "distance": 1200
  }
]
```

#### Get Single Report
```http
GET /api/reports/1234567890

Response: 200
{
  "id": 1234567890,
  "latitude": 23.0225,
  ...
}
```

#### Create Report
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 23.0225,
  "longitude": 72.5714,
  "severity": "HIGH",
  "depth": "KNEE",
  "photoUrl": "/uploads/photo123.jpg",
  "description": "Heavy waterlogging near bridge"
}

Response: 201
{
  "id": 1234567890,
  "latitude": 23.0225,
  ...
}
```

#### Delete Report
```http
DELETE /api/reports/1234567890
Authorization: Bearer <token>

Response: 200
{
  "message": "Report deleted successfully"
}
```

#### Vote on Report
```http
POST /api/reports/1234567890/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "vote": 1
}

Response: 200
{
  "reportId": 1234567890,
  "votes": 6,
  "userVote": 1
}
```

#### Verify Report
```http
POST /api/reports/1234567890/verify
Authorization: Bearer <token>

Response: 200
{
  "reportId": 1234567890,
  "verified": true,
  "verifiedAt": "2024-01-15T11:00:00",
  "expiresAt": "2024-01-15T15:00:00"
}
```

---

### 3. Navigation

#### Get Route
```http
POST /api/routes
Content-Type: application/json

{
  "origin": {
    "latitude": 23.0225,
    "longitude": 72.5714
  },
  "destination": {
    "latitude": 23.0335,
    "longitude": 72.5850
  },
  "mode": "driving"
}

Response: 200
{
  "routes": [
    {
      "routeIndex": 0,
      "distance": 5200,
      "duration": 900,
      "hazardCount": 0,
      "isSafe": true,
      "geometry": {...},
      "steps": [...]
    }
  ]
}
```

#### Check Proximity Alerts
```http
POST /api/alerts/check
Content-Type: application/json

{
  "latitude": 23.0225,
  "longitude": 72.5714,
  "radius": 500
}

Response: 200
{
  "hasHazards": true,
  "hazards": [
    {
      "id": 1234567890,
      "latitude": 23.0230,
      "longitude": 72.5720,
      "severity": "HIGH",
      "distance": 150,
      "direction": "northeast"
    }
  ],
  "alertMessage": "⚠️ High severity waterlogging 150m northeast!"
}
```

---

### 4. Upload & Search

#### Upload Photo
```http
POST /api/upload
Content-Type: multipart/form-data

photo: <file>

OR

Content-Type: application/json
{
  "photo": "base64_encoded_image"
}

Response: 200
{
  "photoUrl": "/uploads/photo_1234567890.jpg",
  "photoId": "photo_1234567890",
  "size": 245678,
  "uploadedAt": "2024-01-15T10:30:00"
}
```

#### Search Places
```http
GET /api/search?q=gota&lat=23.0225&lng=72.5714

Response: 200
{
  "results": [
    {
      "name": "Gota",
      "address": "Gota, Ahmedabad, Gujarat, India",
      "latitude": 23.0850,
      "longitude": 72.5714,
      "type": "locality"
    }
  ]
}
```

---

### 5. Statistics

#### Get App Stats
```http
GET /api/stats

Response: 200
{
  "totalReports": 1250,
  "activeReports": 45,
  "totalUsers": 5000,
  "reportsToday": 23,
  "topAreas": [
    {
      "name": "23.02, 72.57",
      "reportCount": 150
    }
  ]
}
```

---

## Error Responses

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "status": 400
  }
}
```

### Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `410` - Gone (Expired)
- `500` - Server Error

---

## Rate Limiting
- Reports: 10 per hour per user
- Votes: 50 per hour per user
- Search: 100 per hour per user

---

## Environment Variables

Create `.env` file:
```
SECRET_KEY=your-secret-key-here
MAPBOX_TOKEN=your-mapbox-token
PORT=8000
```

---

## Running the Server

```bash
cd backend
pip install -r requirements.txt
python app/main.py
```

Server runs at: http://localhost:8000
