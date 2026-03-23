import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDWOrNW8bLqQZwJeRLKaVd-Oe9qXyfEKig",
    authDomain: "nexus-afa53.firebaseapp.com",
    projectId: "nexus-afa53",
    storageBucket: "nexus-afa53.firebasestorage.app",
    messagingSenderId: "330941104356",
    appId: "1:330941104356:web:4c13066c4fa22c7315acf1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();