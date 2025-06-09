// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCNbBFu-K9eFd603oEdMZs38x0trCEMz2s",
  authDomain: "detector-gas-v2.firebaseapp.com",
  databaseURL: "https://detector-gas-v2-default-rtdb.firebaseio.com",
  projectId: "detector-gas-v2",
  storageBucket: "detector-gas-v2.appspot.com",
  messagingSenderId: "701808955147",
  appId: "1:701808955147:web:72de4d2ffc85142fa35c0e",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
