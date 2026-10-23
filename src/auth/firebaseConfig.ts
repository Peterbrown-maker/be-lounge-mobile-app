import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnCsX7Gnl5hQ1UY6SN1RZYuiZqXjAZARI",
  authDomain: "flavor-hos-delivery.firebaseapp.com",
  projectId: "flavor-hos-delivery",
  storageBucket: "flavor-hos-delivery.firebasestorage.app",
  messagingSenderId: "1036842544092",
  appId: "1:1036842544092:web:ce133f5515ba55915cfd19",
  measurementId: "G-SQWJY981QR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { auth };
export default app;
