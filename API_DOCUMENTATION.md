# DVAGO-SMR Backend API Documentation

Base URL:

```text
http://localhost:5000/api
```

Health check:

```text
GET http://localhost:5000/
```

Auth header for protected routes:

```http
Authorization: Bearer <token>
```

Common auth errors:

```json
{
  "success": false,
  "message": "Not authorized, token missing"
}
```

```json
{
  "success": false,
  "message": "Invalid token"
}
```

## Environment Variables

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
OCR_SPACE_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

| Variable | Required | Used For |
|---|---:|---|
| `PORT` | No | Express server port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection. |
| `JWT_SECRET` | Yes | Signing/verifying backend JWT tokens. |
| `OCR_SPACE_API_KEY` | Yes for scan API | OCR.space API key. |
| `FIREBASE_PROJECT_ID` | Yes for Firebase auth | Firebase Admin SDK service account. |
| `FIREBASE_CLIENT_EMAIL` | Yes for Firebase auth | Firebase Admin SDK service account. |
| `FIREBASE_PRIVATE_KEY` | Yes for Firebase auth | Firebase Admin SDK service account private key. Escaped `\n` is converted to real newlines. |

## Auth APIs

Mounted at:

```text
/api/auth
```

### Register User

```http
POST /api/auth/register
```

Auth: Public

Purpose: Create a new email/password user and return a backend JWT.

Request body:

```json
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": {
    "id": "665f1a...",
    "name": "Ali Khan",
    "email": "ali@example.com"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

Notes:

- Password is hashed with `bcryptjs`.
- JWT expires in `7d`.

### Login User

```http
POST /api/auth/login
```

Auth: Public

Purpose: Login using email/password and return a backend JWT.

Request body:

```json
{
  "email": "ali@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": "665f1a...",
    "name": "Ali Khan",
    "email": "ali@example.com"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Notes:

- Firebase-only users without a password cannot login through this endpoint.

### Firebase Auth

```http
POST /api/auth/firebase
```

Auth: Public

Purpose: Verify a Firebase ID token server-side, find/create a backend user, and return a backend JWT.

Request body:

```json
{
  "idToken": "<firebase-id-token>"
}
```

Success response:

```json
{
  "success": true,
  "message": "Firebase login successful",
  "token": "<jwt>",
  "user": {
    "id": "665f1a...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "firebaseUid": "firebase_uid_123"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Invalid Firebase token"
}
```

Notes:

- Verifies token with Firebase Admin SDK.
- Finds user by `firebaseUid` or `email`.
- Creates user if missing.
- Backfills `firebaseUid` if an email/password user signs in with Firebase later.

### Auth Profile

```http
GET /api/auth/profile
```

Auth: Required

Purpose: Return the authenticated user profile without password.

Success response:

```json
{
  "success": true,
  "user": {
    "_id": "665f1a...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "firebaseUid": "firebase_uid_123",
    "notifications": {
      "pushEnabled": true,
      "voiceEnabled": false,
      "soundEnabled": true,
      "vibrationEnabled": true
    },
    "createdAt": "2026-05-02T10:00:00.000Z",
    "updatedAt": "2026-05-02T10:00:00.000Z"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "User not found"
}
```

Notes:

- This overlaps with `GET /api/user/profile`, but this route returns the raw user object under `success/user`.

## User, Profile, And Settings APIs

Mounted at:

```text
/api/user
```

### Get User Profile

```http
GET /api/user/profile
```

Auth: Required

Purpose: Load user profile, health profile fields, app settings, and profile stats.

Success response:

```json
{
  "user": {
    "_id": "665f1a...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "personalInformation": {
      "phone": "+923001234567",
      "dateOfBirth": "1995-01-01",
      "gender": "Male",
      "emergencyContact": "+923009999999"
    },
    "medicalHistory": {
      "bloodGroup": "B+",
      "allergies": "Penicillin",
      "chronicConditions": "Diabetes",
      "pastSurgeries": "",
      "currentDiseases": ""
    }
  },
  "stats": {
    "medicines": 3,
    "adherence": 75,
    "daysActive": 5
  },
  "settings": {
    "notifications": {
      "pushEnabled": true,
      "voiceEnabled": false,
      "soundEnabled": true,
      "vibrationEnabled": true
    },
    "reminderLeadTime": 10,
    "language": "en",
    "theme": "light"
  }
}
```

Error response:

```json
{
  "message": "User not found"
}
```

Notes:

- `adherence` is calculated from all `DoseLog` records for the user.
- `daysActive` is calculated from user `createdAt`.

### Update User Profile

```http
PUT /api/user/profile
```

Auth: Required

Purpose: Update basic profile, personal information, and medical history.

Request body:

```json
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "personalInformation": {
    "phone": "+923001234567",
    "dateOfBirth": "1995-01-01",
    "gender": "Male",
    "emergencyContact": "+923009999999"
  },
  "medicalHistory": {
    "bloodGroup": "B+",
    "allergies": "Penicillin",
    "chronicConditions": "Diabetes",
    "pastSurgeries": "Appendectomy",
    "currentDiseases": "Hypertension"
  }
}
```

Success response:

```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "665f1a...",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "personalInformation": {
      "phone": "+923001234567",
      "dateOfBirth": "1995-01-01",
      "gender": "Male",
      "emergencyContact": "+923009999999"
    },
    "medicalHistory": {
      "bloodGroup": "B+",
      "allergies": "Penicillin",
      "chronicConditions": "Diabetes",
      "pastSurgeries": "Appendectomy",
      "currentDiseases": "Hypertension"
    }
  }
}
```

Error response:

```json
{
  "message": "User not found"
}
```

Notes:

- All fields are optional; only provided fields are updated.
- Health profile and medical history are stored in the `User` model.
- There is no separate `/medical-history` route.

### Update User Settings

```http
PUT /api/user/settings
```

Auth: Required

Purpose: Update notification and app settings.

Request body:

```json
{
  "notifications": {
    "pushEnabled": true,
    "voiceEnabled": false,
    "soundEnabled": true,
    "vibrationEnabled": true
  },
  "reminderLeadTime": 10,
  "language": "en",
  "theme": "light"
}
```

Success response:

```json
{
  "message": "Settings updated successfully",
  "settings": {
    "notifications": {
      "pushEnabled": true,
      "voiceEnabled": false,
      "soundEnabled": true,
      "vibrationEnabled": true
    },
    "reminderLeadTime": 10,
    "language": "en",
    "theme": "light"
  }
}
```

Error response:

```json
{
  "message": "User not found"
}
```

Notes:

- Frontend uses these settings to control local Notifee notification scheduling.
- Backend stores settings only; it does not send push notifications.

## Medicines APIs

Mounted at:

```text
/api/medicines
```

All medicine endpoints require auth.

### Create Medicine

```http
POST /api/medicines
```

Auth: Required

Purpose: Add a medicine, create reminders, and create dose logs when duration/times are provided.

Request body:

```json
{
  "name": "Panadol",
  "dosage": "500mg",
  "frequency": "twice",
  "duration": 7,
  "stock": 20,
  "instructions": "Take after meal",
  "times": ["09:00", "21:00"],
  "category": "Painkiller",
  "color": "#74BA1E"
}
```

Supported fields:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `name` | string | Yes | Medicine name. |
| `dosage` | string | Yes | Example: `500mg`. |
| `stock` | number | Yes | Current stock count. |
| `frequency` | string | No | Enum: `once`, `twice`, `thrice`, `four`. Defaults to `once`. |
| `duration` | number | No | Days. If `> 0`, dose logs are generated. |
| `instructions` | string | No | Free text. |
| `times` | string[] | No | 24-hour format, e.g. `["09:00"]`. |
| `category` | string | No | Free text. |
| `color` | string | No | Defaults to `#74BA1E`. |

Success response:

```json
{
  "message": "Medicine added successfully",
  "medicine": {
    "_id": "665f2b...",
    "user": "665f1a...",
    "name": "Panadol",
    "dosage": "500mg",
    "frequency": "twice",
    "duration": 7,
    "stock": 20,
    "instructions": "Take after meal",
    "times": ["09:00", "21:00"],
    "category": "Painkiller",
    "color": "#74BA1E",
    "isActive": true,
    "createdAt": "2026-05-02T10:00:00.000Z",
    "updatedAt": "2026-05-02T10:00:00.000Z"
  },
  "doseSchedules": [
    {
      "id": "665f3c...",
      "scheduledAt": "2026-05-02T04:00:00.000Z"
    }
  ]
}
```

Error response:

```json
{
  "message": "Name, dosage, and stock are required"
}
```

Notes:

- Creates `Medicine`.
- Creates `Reminder` documents for each time.
- If `duration > 0`, creates `DoseLog` records for each day/time.
- Dose logs scheduled in the past are initialized as `missed`; future logs as `pending`.
- `doseSchedules` is used by the frontend to schedule local notifications.

### Get Medicines

```http
GET /api/medicines
```

Auth: Required

Purpose: List all medicines for the authenticated user.

Success response:

```json
[
  {
    "_id": "665f2b...",
    "user": "665f1a...",
    "name": "Panadol",
    "dosage": "500mg",
    "frequency": "twice",
    "duration": 7,
    "stock": 20,
    "instructions": "Take after meal",
    "times": ["09:00", "21:00"],
    "category": "Painkiller",
    "color": "#74BA1E",
    "isActive": true,
    "createdAt": "2026-05-02T10:00:00.000Z",
    "updatedAt": "2026-05-02T10:00:00.000Z"
  }
]
```

Error response:

```json
{
  "message": "Server error message"
}
```

Notes:

- Sorted by newest first.

### Get Medicine By ID

```http
GET /api/medicines/:id
```

Auth: Required

Purpose: Fetch one medicine document.

Params:

| Param | Description |
|---|---|
| `id` | Medicine MongoDB `_id`. |

Success response:

```json
{
  "_id": "665f2b...",
  "name": "Panadol",
  "dosage": "500mg",
  "stock": 20,
  "times": ["09:00", "21:00"]
}
```

Error response:

```json
{
  "message": "Medicine not found"
}
```

Notes:

- Ensures medicine belongs to the authenticated user.

### Get Medicine Details

```http
GET /api/medicines/:id/details
```

Auth: Required

Purpose: Fetch medicine detail view data, upcoming schedule, and history.

Params:

| Param | Description |
|---|---|
| `id` | Medicine MongoDB `_id`. |

Success response:

```json
{
  "medicine": {
    "_id": "665f2b...",
    "name": "Panadol",
    "dosage": "500mg",
    "frequency": "twice",
    "stock": 19,
    "category": "Painkiller",
    "color": "#74BA1E",
    "instructions": "Take after meal",
    "nextDose": "09:00 AM"
  },
  "schedule": [
    {
      "id": "665f3c...",
      "time": "09:00 AM",
      "date": "Sat May 02 2026",
      "status": "upcoming"
    }
  ],
  "history": [
    {
      "id": "665f3d...",
      "date": "Fri May 01 2026",
      "time": "09:00 AM",
      "status": "taken",
      "onTime": true
    }
  ]
}
```

Error response:

```json
{
  "message": "Medicine not found"
}
```

Notes:

- Upcoming schedule: next 10 dose logs with `scheduledAt >= now`.
- History: last 20 dose logs with `scheduledAt < now`.
- `onTime` is true when taken within 30 minutes of scheduled time.

### Update Medicine

```http
PUT /api/medicines/:id
```

Auth: Required

Purpose: Update medicine fields.

Params:

| Param | Description |
|---|---|
| `id` | Medicine MongoDB `_id`. |

Request body:

```json
{
  "name": "Panadol Extra",
  "dosage": "500mg",
  "frequency": "twice",
  "duration": 5,
  "stock": 15,
  "instructions": "Take after food",
  "times": ["10:00", "22:00"],
  "category": "Painkiller",
  "color": "#74BA1E",
  "isActive": true
}
```

Success response:

```json
{
  "message": "Medicine updated successfully",
  "medicine": {
    "_id": "665f2b...",
    "name": "Panadol Extra",
    "stock": 15
  }
}
```

Error response:

```json
{
  "message": "Medicine not found"
}
```

Notes:

- Only provided supported fields are updated.
- Does not currently regenerate reminders/dose logs when `times` or `duration` changes.

### Delete Medicine

```http
DELETE /api/medicines/:id
```

Auth: Required

Purpose: Delete a medicine and related reminder/dose records.

Params:

| Param | Description |
|---|---|
| `id` | Medicine MongoDB `_id`. |

Success response:

```json
{
  "message": "Medicine deleted successfully"
}
```

Error response:

```json
{
  "message": "Medicine not found"
}
```

Notes:

- Deletes the `Medicine`.
- Deletes related `Reminder` records.
- Deletes related `DoseLog` records.
- Frontend should also cancel local scheduled notifications if applicable.

## Dose APIs

Mounted at:

```text
/api/doses
```

### Mark Dose As Taken

```http
POST /api/doses/:id/taken
```

Auth: Required

Purpose: Mark a dose log as taken.

Params:

| Param | Description |
|---|---|
| `id` | DoseLog `_id`. |

Success response:

```json
{
  "message": "Dose marked as taken",
  "dose": {
    "_id": "665f3c...",
    "medicine": {
      "_id": "665f2b...",
      "name": "Panadol",
      "dosage": "500mg"
    },
    "scheduledAt": "2026-05-02T04:00:00.000Z",
    "takenAt": "2026-05-02T03:50:00.000Z",
    "status": "taken"
  }
}
```

Error response:

```json
{
  "message": "Dose not found"
}
```

Notes:

- Sets `status` to `taken`.
- Sets `takenAt` to current date/time.
- Decreases medicine stock by `1` only if previous status was not already `taken`.
- Stock does not go below `0`.
- Frontend should cancel local notification ID `reminder-{doseId}`.

### Mark Dose As Missed

```http
POST /api/doses/:id/missed
```

Auth: Required

Purpose: Mark a dose log as missed.

Params:

| Param | Description |
|---|---|
| `id` | DoseLog `_id`. |

Success response:

```json
{
  "message": "Dose marked as missed",
  "dose": {
    "_id": "665f3c...",
    "scheduledAt": "2026-05-02T04:00:00.000Z",
    "takenAt": null,
    "status": "missed"
  }
}
```

Error response:

```json
{
  "message": "Dose not found"
}
```

Notes:

- Sets `takenAt` to `null`.
- Does not adjust stock.

## Dashboard API

Mounted at:

```text
/api/dashboard
```

### Get Dashboard

```http
GET /api/dashboard
```

Auth: Required

Purpose: Get dashboard stats, next dose, and today's schedule.

Success response:

```json
{
  "stats": {
    "medicines": 3,
    "adherence": 67,
    "today": 6
  },
  "nextDose": {
    "_id": "665f3c...",
    "medicine": {
      "_id": "665f2b...",
      "name": "Panadol",
      "dosage": "500mg"
    },
    "scheduledAt": "2026-05-02T16:00:00.000Z",
    "status": "pending"
  },
  "todaySchedule": [
    {
      "_id": "665f3c...",
      "medicine": {
        "_id": "665f2b...",
        "name": "Panadol",
        "dosage": "500mg"
      },
      "scheduledAt": "2026-05-02T16:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

Error response:

```json
{
  "message": "Server error message"
}
```

Notes:

- `stats.adherence` is today's taken dose count divided by today's total dose logs.
- `nextDose` is the nearest future `pending` dose.
- `todaySchedule` includes all dose logs scheduled today.

## Analytics API

Mounted at:

```text
/api/analytics
```

### Get Analytics

```http
GET /api/analytics?period=week
```

Auth: Required

Purpose: Get adherence analytics for week, month, or year.

Query params:

| Query | Required | Values | Default |
|---|---:|---|---|
| `period` | No | `week`, `month`, `year` | `week` |

Success response:

```json
{
  "period": "week",
  "stats": {
    "adherenceRate": 75,
    "dosesTaken": "3/4",
    "onTimeRate": 67,
    "streak": "2 days"
  },
  "adherenceData": [
    {
      "day": "Sat",
      "taken": 2,
      "total": 3,
      "percentage": 67
    }
  ],
  "medicineStats": [
    {
      "name": "Panadol",
      "taken": 2,
      "total": 3,
      "adherence": 67
    }
  ],
  "bestTime": {
    "slot": "Morning",
    "rate": "100%"
  }
}
```

Error response:

```json
{
  "message": "Server error message"
}
```

Notes:

- `week`: last 7 days including today.
- `month`: last 30 days including today.
- `year`: last 12 months starting from month start.
- Taken doses are counted if `scheduledAt` is in range or `takenAt` is in range.
- For taken doses, analytics grouping uses `takenAt` if available.
- Pending doses only count if scheduled time has already passed.
- Controller currently logs analytics debug data to console.

## Scan / OCR API

Mounted at:

```text
/api/scan
```

### Scan Medicine Image

```http
POST /api/scan/medicine
```

Auth: Required

Purpose: Upload a medicine image and extract medicine info using OCR.space.

Request type:

```http
multipart/form-data
```

File upload field:

```text
image
```

Accepted image types:

- `jpg`
- `jpeg`
- `png`
- `webp`

Upload limit:

- `5MB` backend multer limit

Request body:

| Field | Type | Required |
|---|---|---:|
| `image` | file | Yes |

Success response with parsed text:

```json
{
  "parsed": {
    "name": "PANADOL",
    "dosage": "500mg",
    "category": ""
  }
}
```

Success response when OCR finds no text:

```json
{
  "parsed": {
    "name": "",
    "dosage": "",
    "category": ""
  }
}
```

Error response, missing image:

```json
{
  "message": "Image file is required"
}
```

Error response, file too large:

```json
{
  "message": "File too large. Max size is 5MB"
}
```

Error response, unsupported file:

```json
{
  "message": "Only image files are allowed"
}
```

Error response, OCR failed:

```json
{
  "message": "OCR.space failed to process image"
}
```

Notes:

- Uses `ocr-space-api-wrapper`.
- Requires `OCR_SPACE_API_KEY`.
- OCR language is English: `eng`.
- Uploaded temp file is deleted after OCR completes or fails.
- Frontend currently tries to keep scan image under `1.5MB` before sending.

## Notifications APIs

Mounted at:

```text
/api/notifications
```

Important: These are not push notification delivery APIs. They generate notification list data from today's dose logs and cleared-notification records.

### Get Notifications

```http
GET /api/notifications
```

Auth: Required

Purpose: List today's reminder/taken/missed notifications.

Success response:

```json
{
  "notifications": [
    {
      "id": "665f3c...",
      "sourceId": "665f3c...",
      "title": "Dosage Reminder",
      "message": "Panadol 500mg is scheduled for 09:00 AM.",
      "type": "reminder",
      "time": "09:00 AM"
    },
    {
      "id": "665f3d...",
      "sourceId": "665f3d...",
      "title": "Dose Taken",
      "message": "Panadol 500mg was marked as taken.",
      "type": "taken",
      "time": "10:00 AM"
    },
    {
      "id": "665f3e...",
      "sourceId": "665f3e...",
      "title": "Missed Dose",
      "message": "Panadol 500mg was missed.",
      "type": "missed",
      "time": "11:00 AM"
    }
  ]
}
```

Error response:

```json
{
  "message": "Server error message"
}
```

Notes:

- Builds notifications from today's `DoseLog` records.
- Excludes dose notifications that were cleared through `DELETE /api/notifications/clear-all`.
- There is no standalone `Notification` model; persistence is handled through `ClearedNotification`.

### Clear All Notifications

```http
DELETE /api/notifications/clear-all
```

Auth: Required

Purpose: Clear today's generated dose notifications so they do not reappear.

Success response:

```json
{
  "message": "Notifications cleared",
  "clearedCount": 4
}
```

Error response:

```json
{
  "message": "Server error message"
}
```

Notes:

- Finds today's dose logs.
- Upserts one `ClearedNotification` per dose.
- Does not delete dose logs.
- Only affects today's generated notifications.

## Health Profile / Medical History APIs

There are no separate health profile route groups.

Implemented through:

```http
GET /api/user/profile
PUT /api/user/profile
```

Supported personal information fields:

```json
{
  "phone": "+923001234567",
  "dateOfBirth": "1995-01-01",
  "gender": "Male",
  "emergencyContact": "+923009999999"
}
```

Supported medical history fields:

```json
{
  "bloodGroup": "B+",
  "allergies": "Penicillin",
  "chronicConditions": "Diabetes",
  "pastSurgeries": "Appendectomy",
  "currentDiseases": "Hypertension"
}
```

## Public Root Endpoint

### Server Health Check

```http
GET /
```

Auth: Public

Purpose: Confirm backend server is running.

Success response:

```text
DVAGO backend is running
```

Notes:

- This endpoint is not under `/api`.

## cURL Examples

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ali Khan",
    "email": "ali@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ali@example.com",
    "password": "password123"
  }'
```

### Firebase Auth

```bash
curl -X POST http://localhost:5000/api/auth/firebase \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<firebase-id-token>"
  }'
```

### Get Profile

```bash
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <token>"
```

### Update Profile

```bash
curl -X PUT http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ali Khan",
    "personalInformation": {
      "phone": "+923001234567",
      "dateOfBirth": "1995-01-01",
      "gender": "Male",
      "emergencyContact": "+923009999999"
    },
    "medicalHistory": {
      "bloodGroup": "B+",
      "allergies": "Penicillin",
      "chronicConditions": "Diabetes",
      "pastSurgeries": "",
      "currentDiseases": ""
    }
  }'
```

### Update Settings

```bash
curl -X PUT http://localhost:5000/api/user/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notifications": {
      "pushEnabled": true,
      "voiceEnabled": false,
      "soundEnabled": true,
      "vibrationEnabled": true
    },
    "reminderLeadTime": 10,
    "language": "en",
    "theme": "light"
  }'
```

### Create Medicine

```bash
curl -X POST http://localhost:5000/api/medicines \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Panadol",
    "dosage": "500mg",
    "frequency": "twice",
    "duration": 7,
    "stock": 20,
    "instructions": "Take after meal",
    "times": ["09:00", "21:00"],
    "category": "Painkiller"
  }'
```

### Get Medicines

```bash
curl http://localhost:5000/api/medicines \
  -H "Authorization: Bearer <token>"
```

### Get Medicine Details

```bash
curl http://localhost:5000/api/medicines/<medicineId>/details \
  -H "Authorization: Bearer <token>"
```

### Update Medicine

```bash
curl -X PUT http://localhost:5000/api/medicines/<medicineId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 15,
    "instructions": "Take after food"
  }'
```

### Delete Medicine

```bash
curl -X DELETE http://localhost:5000/api/medicines/<medicineId> \
  -H "Authorization: Bearer <token>"
```

### Mark Dose Taken

```bash
curl -X POST http://localhost:5000/api/doses/<doseId>/taken \
  -H "Authorization: Bearer <token>"
```

### Mark Dose Missed

```bash
curl -X POST http://localhost:5000/api/doses/<doseId>/missed \
  -H "Authorization: Bearer <token>"
```

### Dashboard

```bash
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

### Analytics

```bash
curl "http://localhost:5000/api/analytics?period=week" \
  -H "Authorization: Bearer <token>"
```

### Scan Medicine Image

```bash
curl -X POST http://localhost:5000/api/scan/medicine \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/medicine-label.jpg"
```

### Get Notifications

```bash
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <token>"
```

### Clear All Notifications

```bash
curl -X DELETE http://localhost:5000/api/notifications/clear-all \
  -H "Authorization: Bearer <token>"
```

## Frontend-Only / TODO Notes

- Local medicine reminder notifications are frontend-only through Notifee. Backend stores notification settings but does not deliver push notifications.
- Notification list API is generated from today's dose logs; there is no full `Notification` collection for arbitrary notifications.
- `DELETE /api/notifications/clear-all` only clears today's generated dose notifications.
- Updating medicine `times` or `duration` does not currently regenerate reminders or dose logs.
- There are no separate endpoints for Prescriptions or My Doctors.
- Health profile and medical history are implemented inside `GET /api/user/profile` and `PUT /api/user/profile`, not separate route groups.
- Scanner OCR returns only basic parsed fields: `name`, `dosage`, `category`. Other medicine fields must be entered or edited by the frontend.
