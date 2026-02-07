# 🚀 Civix API - Quick Reference Card

## Base URL
```
http://localhost:8000/api
```

## 🔑 Authentication
```
Authorization: Bearer <token>
```

---

## 📍 Essential Endpoints

### 1️⃣ Register User (First Time)
```http
POST /api/users/register
{
  "deviceId": "unique_device_id",
  "name": "User Name"
}
→ Returns: { userId, token, createdAt }
```

### 2️⃣ Get All Reports
```http
GET /api/reports?lat=23.0225&lng=72.5714&radius=5000
→ Returns: Array of reports with distance
```

### 3️⃣ Create Report
```http
POST /api/reports
Authorization: Bearer <token>
{
  "latitude": 23.0225,
  "longitude": 72.5714,
  "severity": "HIGH",
  "depth": "KNEE",
  "photoUrl": "/uploads/photo.jpg",
  "description": "Heavy waterlogging"
}
→ Returns: Created report object
```

### 4️⃣ Upload Photo
```http
POST /api/upload
Content-Type: multipart/form-data
photo: <file>
→ Returns: { photoUrl, photoId, size }
```

### 5️⃣ Get Safe Route
```http
POST /api/routes
{
  "origin": { "latitude": 23.0225, "longitude": 72.5714 },
  "destination": { "latitude": 23.0335, "longitude": 72.5850 },
  "mode": "driving"
}
→ Returns: { routes: [{ distance, duration, hazardCount, geometry, steps }] }
```

### 6️⃣ Check Nearby Hazards
```http
POST /api/alerts/check
{
  "latitude": 23.0225,
  "longitude": 72.5714,
  "radius": 500
}
→ Returns: { hasHazards, hazards[], alertMessage }
```

### 7️⃣ Vote on Report
```http
POST /api/reports/:id/vote
Authorization: Bearer <token>
{
  "vote": 1  // 1 or -1
}
→ Returns: { reportId, votes, userVote }
```

### 8️⃣ Search Places
```http
GET /api/search?q=gota&lat=23.0225&lng=72.5714
→ Returns: { results: [{ name, address, latitude, longitude }] }
```

---

## 📊 Data Types

### Severity
- `LOW` - Minor waterlogging
- `MEDIUM` - Moderate waterlogging
- `HIGH` - Severe waterlogging

### Depth
- `ANKLE` - Ankle deep
- `KNEE` - Knee deep
- `TYRE` - Tyre deep
- `UNKNOWN` - Unknown depth

### Mode (Navigation)
- `driving` - Car/bike
- `walking` - On foot
- `cycling` - Bicycle

---

## ⚡ Quick Integration Code (Flutter)

### 1. Register User
```dart
final response = await http.post(
  Uri.parse('$baseUrl/users/register'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'deviceId': await getDeviceId(),
    'name': userName,
  }),
);
final data = jsonDecode(response.body);
final token = data['token'];
// Save token
```

### 2. Get Reports
```dart
final response = await http.get(
  Uri.parse('$baseUrl/reports?lat=$lat&lng=$lng&radius=5000'),
);
final reports = jsonDecode(response.body) as List;
```

### 3. Create Report
```dart
final response = await http.post(
  Uri.parse('$baseUrl/reports'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'latitude': lat,
    'longitude': lng,
    'severity': 'HIGH',
    'depth': 'KNEE',
    'photoUrl': photoUrl,
  }),
);
```

### 4. Upload Photo
```dart
var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/upload'));
request.files.add(await http.MultipartFile.fromPath('photo', imagePath));
var response = await request.send();
var responseData = await response.stream.bytesToString();
var data = jsonDecode(responseData);
final photoUrl = data['photoUrl'];
```

---

## 🎯 Common Patterns

### Check if user is registered
```dart
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('auth_token');
if (token == null) {
  // Register user
} else {
  // Use existing token
}
```

### Handle errors
```dart
if (response.statusCode == 200) {
  // Success
} else {
  final error = jsonDecode(response.body)['error'];
  print('Error: ${error['message']}');
}
```

### Refresh reports periodically
```dart
Timer.periodic(Duration(seconds: 30), (timer) {
  fetchReports();
});
```

---

## 🔥 Pro Tips

1. **Save token** after registration - it's valid for 365 days
2. **Compress images** before upload (already done by backend)
3. **Filter reports** by radius to reduce data
4. **Cache reports** locally for offline viewing
5. **Use proximity alerts** for real-time warnings
6. **Verify reports** to extend their lifetime
7. **Vote on reports** to improve accuracy

---

## 📞 Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| 400 | Bad Request | Invalid data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not allowed |
| 404 | Not Found | Resource not found |
| 410 | Gone | Report expired |
| 500 | Server Error | Backend issue |

---

## 🧪 Test Commands

```bash
# Start server
python app/main.py

# Test registration
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test123"}'

# Test get reports
curl http://localhost:8000/api/reports
```

---

## 📱 Mobile-Specific Notes

- All coordinates in **decimal degrees**
- Distance always in **meters**
- Duration always in **seconds**
- Timestamps in **ISO 8601** format
- Photos max **1200x1200** pixels
- Reports expire after **4 hours**
- Token expires after **365 days**

---

**Need help? Check API_DOCUMENTATION.md for complete details!**
