// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsVSa-p1yR47XfkfqpRQI6DdYvVe-BOoM",
  authDomain: "diagnos-b985f.firebaseapp.com",
  projectId: "diagnos-b985f",
  storageBucket: "diagnos-b985f.firebasestorage.app",
  messagingSenderId: "742555277180",
  appId: "1:742555277180:web:12b2c98b7e7d5271d876f9",
  measurementId: "G-ZTZYCL0WM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
