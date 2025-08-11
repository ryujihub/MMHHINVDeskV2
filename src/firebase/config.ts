import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABZw1Jk2WdOFqmp2ww8lYV0DBdcVR50GI",
  authDomain: "hardwareinventory-65123.firebaseapp.com",
  databaseURL: "https://hardwareinventory-65123-default-rtdb.firebaseio.com",
  projectId: "hardwareinventory-65123",
  storageBucket: "hardwareinventory-65123.firebasestorage.app",
  messagingSenderId: "1006715726520",
  appId: "1:1006715726520:web:13897a36fb527e8194224d",
  measurementId: "G-Y4ZHE3GBN5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
