import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA689NihIVNCrz719MC5ddPGWW8-qnsSbo",
  authDomain: "zenspace-1f324.firebaseapp.com",
  projectId: "zenspace-1f324",
  storageBucket: "zenspace-1f324.firebasestorage.app",
  messagingSenderId: "148476777772",
  appId: "1:148476777772:web:5faf327ce471197f768889",
  measurementId: "G-91KHP3L1S1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);