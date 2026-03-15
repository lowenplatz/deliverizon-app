# Deliverizon App — Setup & Deploy Guide

## What's In This Folder

```
deliverizon-app/
├── src/
│   ├── main.jsx          ← Entry point with routing
│   ├── App.jsx            ← 4-screen consumer demo (main route: /)
│   ├── FleetDashboard.jsx ← Operations dashboard (route: /dashboard)
│   └── firebase.js        ← Firebase config (YOU EDIT THIS)
├── index.html
├── package.json
├── vite.config.js
├── firebase.json          ← Firebase Hosting config
└── .firebaserc            ← Firebase project ID (YOU EDIT THIS)
```

## Routes

- `http://localhost:5173/` → Consumer app demo (phone frame, 4 screens)
- `http://localhost:5173/dashboard` → Fleet operations dashboard (full screen)

## Step-by-Step Setup

### 1. Open Command Prompt (NOT PowerShell)

Press Win key, type `cmd`, press Enter.

Navigate to this folder:
```
cd path\to\deliverizon-app
```

### 2. Install dependencies

```
npm install
```

### 3. Add your Firebase config

Open `src/firebase.js` in any text editor and replace the placeholder values
with your real Firebase config. Find these in:

**Firebase Console → Project Settings (gear icon) → General → Your Apps**

If you don't have a web app registered yet:
1. Click "Add app" → Web (</> icon)
2. Name it "Deliverizon"
3. Copy the config object

### 4. Update .firebaserc

Open `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your actual
Firebase project ID (found at the top of your Firebase Console).

### 5. Test locally

```
npm run dev
```

Open `http://localhost:5173/` — you should see the phone-frame demo app.
Open `http://localhost:5173/dashboard` — you should see the fleet dashboard.

### 6. Deploy to Firebase Hosting

If you don't have Firebase CLI installed:
```
npm install -g firebase-tools
```

Login (opens browser):
```
firebase login
```

Build and deploy:
```
npm run build
firebase deploy --only hosting
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

## Presentation Day

- **Laptop 1 (presenting):** Open `/` and walk through the 4-screen demo
- **Laptop 2 (Q&A background):** Open `/dashboard` full-screen

## Demo Walkthrough

1. Select Sierre → type "Umbrella" → Non-Food → Send Now → tap Snell Library → Confirm
2. Screen switches to Sierre: "Receive Now" → pick West Village H → Continue
3. Bot animates to Snell Library → "I've Deposited My Item"
4. Bot animates to West Village H → type 4829 → Unlock → Confetti!
5. "Replay Full Demo" resets everything
