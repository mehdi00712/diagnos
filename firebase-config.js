import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsVSa-p1yR47XfkfqpRQI6DdYvVe-BOoM",
  authDomain: "diagnos-b985f.firebaseapp.com",
  projectId: "diagnos-b985f",
  storageBucket: "diagnos-b985f.firebasestorage.app",
  messagingSenderId: "742555277180",
  appId: "1:742555277180:web:12b2c98b7e7d5271d876f9",
  measurementId: "G-ZTZYCL0WM3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);
