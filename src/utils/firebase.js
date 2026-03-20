// src/utils/firebase.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCdz5qm4MqZdERLOS7uClIfZXw7E-RL0dc",
  authDomain: "ss-app-store-2937b.firebaseapp.com",
  projectId: "ss-app-store-2937b",
  storageBucket: "ss-app-store-2937b.firebasestorage.app",
  messagingSenderId: "986301939333",
  appId: "1:986301939333:web:b9a2072d6479292cfdb3ec"
};

const app = initializeApp(firebaseConfig);
export default app;
