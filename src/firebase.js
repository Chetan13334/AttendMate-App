import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAG2qC9-Addcoz1S8QnH6CObpqZnFVE4sY",
  authDomain: "attendance-management-b58f5.firebaseapp.com",
  projectId: "attendance-management-b58f5",
  storageBucket: "attendance-management-b58f5.appspot.com", // ✅ fixed here
  messagingSenderId: "1064034709705",
  appId: "1:1064034709705:web:37b236ea3aa23e90ca9d18"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
