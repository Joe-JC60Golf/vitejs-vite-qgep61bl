// firebase.js
// Initializes Firebase and exports the pieces the rest of the app needs.
// Place this in your project's src/ folder.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// These values are safe to keep in client-side code — they identify your
// project, they are not secret keys. Security is enforced separately via
// Firestore/Storage security rules (see the note at the bottom of this file).
const firebaseConfig = {
  apiKey: "AIzaSyDT8473MjdZvNEHqsYFpNhTN0BQBVdkAu4",
  authDomain: "jc60---the-loop.firebaseapp.com",
  projectId: "jc60---the-loop",
  storageBucket: "jc60---the-loop.firebasestorage.app",
  messagingSenderId: "1060819311038",
  appId: "1:1060819311038:web:a3f9cd11636f7bc4af01ef",
  measurementId: "G-GF8NMR4WM9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics only works in a real browser (not during server-side rendering
// or in test environments), so it's loaded separately and guarded.
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  const supported = await isSupported();
  return supported ? getAnalytics(app) : null;
}

/*
IMPORTANT — security rules:
Firestore and Storage both start in "test mode," which means anyone with
your config can read and write everything. Before this app has real member
data in it, lock these down in the Firebase console:

Firestore Database → Rules, something like:
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }

Storage → Rules, something like:
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if request.auth != null;
      }
    }
  }

Both of the above just require someone to be logged in — good enough to
start. We can make these more specific later (e.g. members can only edit
their own profile) once accounts are working end to end.
*/

