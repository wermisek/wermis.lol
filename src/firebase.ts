import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Tutaj wkleimy Twoją konfigurację
const firebaseConfig = {
  apiKey: "AIzaSyAs77yNACRhDIiMCzplhpDYh9G3aonyaHk",
  authDomain: "onelink-46bf2.firebaseapp.com",
  projectId: "onelink-46bf2",
  storageBucket: "onelink-46bf2.appspot.com",
  messagingSenderId: "839978143822",
  appId: "1:839978143822:web:aa27d577878c4c82b9b31f",
  measurementId: "G-CYDD7928KS"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja usług
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics }; 