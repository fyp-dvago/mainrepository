# DVAGO Smart Health Reminder

DVAGO-SMR is a Smart Medicine Reminder System built with a React Native mobile app and a Node.js/Express backend. It helps users manage medicines, schedule local reminder notifications, track dose adherence, scan medicine labels with OCR, and maintain a basic health profile.

## Key Features

- Email/password authentication with Firebase Authentication.
- Google Sign-In with Firebase Authentication.
- Backend JWT session token for API access.
- Medicine CRUD with dosage, stock, instructions, category, duration, and reminder times.
- Dose tracking with mark-as-taken and mark-as-missed actions.
- Dashboard with today's schedule, next dose, adherence, and medicine counts.
- Analytics for weekly, monthly, and yearly adherence.
- Local Android medicine reminders using Notifee.
- Notification preferences for push, sound, vibration, and optional voice reminders.
- Medicine label scan using OCR.space.
- Local image upload handling with multer.
- User profile, personal information, medical history, and settings APIs.
- Notification list and clear-all behavior backed by dose data.

## Tech Stack

### Frontend

- React Native `0.83.1`
- React `19.2.0`
- TypeScript
- React Navigation
- Axios
- AsyncStorage
- React Native Firebase Auth
- Google Sign-In
- Notifee local notifications
- React Native Image Picker
- React Native TTS
- React Native Vector Icons

### Backend

- Node.js
- Express `5`
- MongoDB
- Mongoose
- JWT
- Firebase Admin SDK
- Multer
- OCR.space API wrapper
- bcryptjs
- CORS
- dotenv

## Folder Structure

```text
DVAGO/
|-- README.md
|-- .gitignore
|-- DVAGO-Backend/
|   |-- API_DOCUMENTATION.md
|   |-- server.js
|   |-- config/
|   |   |-- db.js
|   |   `-- firebaseAdmin.js
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- .env.example
|   `-- package.json
`-- UI UX Files (Frontend)/
    |-- App.tsx
    |-- index.js
    |-- src/
    |   |-- config/
    |   |-- navigation/
    |   |-- screens/
    |   `-- services/
    |-- android/
    |-- ios/
    `-- package.json
```

## Prerequisites

- Node.js `>= 20`
- npm
- MongoDB database URI
- Android Studio and Android SDK for Android builds
- Java/JDK compatible with the installed React Native Android toolchain
- React Native development environment
- Firebase project with Authentication enabled
- OCR.space API key

Optional for iOS:

- macOS
- Xcode
- CocoaPods

## Installation

Clone the repository and install dependencies for both apps.

```bash
git clone <repository-url>
cd DVAGO
```

Backend:

```bash
cd DVAGO-Backend
npm install
```

Frontend:

```bash
cd "../UI UX Files (Frontend)"
npm install
```

## Environment Variables

Create a `.env` file in `DVAGO-Backend/`.

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
OCR_SPACE_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Do not commit `.env` or real credentials.

## Backend Setup

Start the backend:

```bash
cd DVAGO-Backend
npm run dev
```

The backend listens on:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api
```

## Frontend Setup

Install dependencies:

```bash
cd "UI UX Files (Frontend)"
npm install
```

The frontend API base URL is configured in:

```text
UI UX Files (Frontend)/src/config/apiConfig.ts
```

Current behavior:

- Android emulator can use `10.0.2.2`.
- iOS simulator can use `localhost`.
- Physical Android devices need the backend computer's LAN IP.

If testing on a physical device, update:

```ts
const PHYSICAL_DEVICE_HOST = 'YOUR_LAN_IP';
```

Make sure the backend is listening on `0.0.0.0` and the phone is on the same network.

## Firebase Setup

Firebase is used for:

- Email/password authentication
- Google Sign-In
- Firebase ID token generation
- Backend token verification through Firebase Admin SDK

Required frontend setup:

1. Create a Firebase project.
2. Enable Email/Password authentication.
3. Enable Google provider.
4. Add the Android app with package name:

```text
com.dvago.smr
```

5. Download `google-services.json`.
6. Place it at:

```text
UI UX Files (Frontend)/android/app/google-services.json
```

Required backend setup:

- Add Firebase Admin SDK credentials to backend `.env`:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Important:

- Do not commit Firebase service account JSON.
- Do not commit private keys.
- Do not commit `.env`.

## OCR Scan Setup

Medicine scanning uses OCR.space through `ocr-space-api-wrapper`.

Add this to backend `.env`:

```env
OCR_SPACE_API_KEY=
```

Scan endpoint:

```text
POST /api/scan/medicine
```

Upload field:

```text
image
```

Backend upload notes:

- Uses multer.
- Stores temporary files in `uploads/`.
- Deletes uploaded image after OCR completes or fails.
- Backend multer file limit is `5MB`.
- Frontend currently captures smaller images using:
  - `quality: 0.4`
  - `maxWidth: 1024`
  - `maxHeight: 1024`
  - a `1.5MB` frontend size guard when `asset.fileSize` is available.

## Notification Setup Notes

Local medicine reminders use Notifee on the device. The backend stores notification settings but does not send push notifications.

Android permissions are declared in:

```text
UI UX Files (Frontend)/android/app/src/main/AndroidManifest.xml
```

Required Android permissions:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.VIBRATE" />
```

Notification behavior:

- Reminder channel ID: `medicine-reminders`
- Stable reminder notification ID: `reminder-{doseId}`
- If a dose is marked as taken, the local reminder is cancelled.
- If push notifications are disabled in settings, new reminders are not scheduled.
- Sound and vibration settings affect Notifee channel/notification behavior.
- Voice reminders use TTS only when the app state allows it; if Android kills the app process, normal notification may still show while TTS may not run.

Device settings users may need to enable:

- App notification permission
- Alarms & reminders / exact alarm permission
- Battery optimization exemption or unrestricted background behavior on aggressive Android devices

## Running The App

Start backend:

```bash
cd DVAGO-Backend
npm run dev
```

Start Metro:

```bash
cd "UI UX Files (Frontend)"
npm start
```

Run Android:

```bash
cd "UI UX Files (Frontend)"
npm run android
```

Run iOS, if configured on macOS:

```bash
cd "UI UX Files (Frontend)"
npm run ios
```

## Android Build Notes

Current Android package name:

```text
com.dvago.smr
```

Important Android files:

```text
UI UX Files (Frontend)/android/app/build.gradle
UI UX Files (Frontend)/android/settings.gradle
UI UX Files (Frontend)/android/app/src/main/AndroidManifest.xml
UI UX Files (Frontend)/android/app/google-services.json
```

If native dependencies or manifest values change, clean and rebuild:

```bash
cd "UI UX Files (Frontend)/android"
./gradlew clean
cd ..
npm run android
```

On Windows PowerShell:

```powershell
cd "UI UX Files (Frontend)\android"
.\gradlew.bat clean
cd ..
npm run android
```

## API Documentation

Complete backend API documentation is available at:

```text
DVAGO-Backend/API_DOCUMENTATION.md
```

It includes:

- Auth APIs
- Firebase auth API
- User/profile APIs
- Settings APIs
- Medicines APIs
- Dose APIs
- Dashboard API
- Analytics API
- Scan/OCR API
- Notifications APIs
- Request/response examples
- cURL examples

## Important Files Not To Commit

Do not commit:

- `.env`
- `.env.*` except `.env.example`
- Firebase service account JSON
- Private keys
- Production secrets
- Local build folders
- `node_modules/`

Examples of sensitive files:

```text
DVAGO-Backend/.env
firebase-adminsdk*.json
serviceAccountKey.json
```

Note: `google-services.json` is required for Android Firebase configuration. Treat production Firebase files carefully and avoid publishing keys for private projects.

## Common Troubleshooting

### Backend Cannot Connect To MongoDB

- Confirm `MONGO_URI` is set.
- Confirm your IP/network is allowed in MongoDB Atlas if using Atlas.
- Confirm the backend terminal shows `MongoDB connected` or equivalent connection success.

### API Calls Fail From Android Emulator

- Use `http://10.0.2.2:5000/api` for Android emulator.
- Use `http://localhost:5000/api` for iOS simulator.
- Use your computer LAN IP for a physical device.
- Confirm backend listens on `0.0.0.0`.

### Firebase Google Login Fails With Developer Error

- Confirm Android package name is `com.dvago.smr`.
- Confirm `google-services.json` package name matches.
- Confirm the frontend uses the Web OAuth client ID where required.
- Confirm SHA-1/SHA-256 fingerprints are registered in Firebase.

### Notifications Do Not Fire

- Confirm app notification permission is granted.
- Confirm exact alarm permission is enabled.
- Confirm battery optimization is not blocking background behavior.
- Confirm medicine has future reminder times.
- Confirm dose status is not already `taken`.
- Check logs from the notification service for scheduled notification ID and trigger time.

### OCR Scan Fails

- Confirm `OCR_SPACE_API_KEY` is set.
- Confirm uploaded image is clear and readable.
- Confirm file type is `jpg`, `jpeg`, `png`, or `webp`.
- Confirm image is below backend multer limit.
- Retake image with better lighting and from slightly farther away if frontend blocks it as too large.

### Multer Upload Folder Error

- The backend upload middleware creates the `uploads/` folder automatically.
- Confirm the backend process has write permission in the project folder.

## Testing Checklist

### Backend

- Register user.
- Login user.
- Firebase login.
- Get profile with JWT.
- Update profile and settings.
- Create medicine with reminder times.
- Confirm dose logs are generated when `duration > 0`.
- Mark dose as taken.
- Confirm stock decreases once.
- Mark dose as missed.
- Load dashboard.
- Load analytics for `week`, `month`, and `year`.
- Upload medicine scan image.
- Load notifications.
- Clear notifications and confirm they do not reappear for today.

### Frontend

- Launch app on Android.
- Register/login with email and password.
- Login with Google.
- Confirm stored JWT allows protected API calls.
- Add medicine manually.
- Add medicine from scan result.
- Schedule reminder 2 minutes ahead.
- Confirm notification appears.
- Mark dose as taken before reminder time.
- Confirm notification is cancelled.
- Toggle push/sound/vibration/voice settings.
- Update personal information.
- Update medical history.
- Check dashboard and analytics refresh after dose updates.

## Future Improvements

- Add automated backend tests.
- Add frontend component and integration tests.
- Add a full notification model for persistent notification history.
- Regenerate reminders and dose logs when medicine times or duration are edited.
- Add prescription upload/management.
- Add doctor management.
- Add role-based admin features if needed.
- Add production-grade logging and monitoring.
- Add API rate limiting.
- Add stronger validation with a schema validation library.
- Add image preprocessing for OCR quality if needed.
- Add deployment documentation for backend and mobile release builds.
