import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9ia8rEO8mEdkF-aBFfSD0c-XoOG-40Dk",
  authDomain: "mesibot-b2401.firebaseapp.com",
  projectId: "mesibot-b2401",
  storageBucket: "mesibot-b2401.firebasestorage.app",
  messagingSenderId: "736815934956",
  appId: "1:736815934956:web:b263bfa1a2f1037ac364c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
