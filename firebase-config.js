const firebaseConfig = {
    apiKey: "AIzaSyC4rzlIcdZgmjG4-4aSCZsj1Ql1GPVuZRQ",
    authDomain: "gpavibe.firebaseapp.com",
    projectId: "gpavibe",
    storageBucket: "gpavibe.appspot.com",  // ✅ THIS
    messagingSenderId: "703511037871",
    appId: "1:703511037871:web:3b754aea20026cf5bad15a",
    measurementId: "G-PWCHP3HR7J"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
// Initialize Cloud Storage
const storage = firebase.storage();
// Initialize Firestore
const db = firebase.firestore();
// Initialize Firebase Authentication
const auth = firebase.auth();
// Initialize Firebase Hosting
const hosting = firebase.hosting();
// Initialize Firebase Functions
const functions = firebase.functions();
// Initialize Firebase Realtime Database
const database = firebase.database();   