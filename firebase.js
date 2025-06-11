// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

    apiKey: "AIzaSyAcRhKCQ6rVbH4N4ynJl8kpdTAK-4pjn6k",
  
    authDomain: "frontend-dashboard-95be8.firebaseapp.com",
  
    projectId: "frontend-dashboard-95be8",
  
    storageBucket: "frontend-dashboard-95be8.firebasestorage.app",
  
    messagingSenderId: "708038210102",
  
    appId: "1:708038210102:web:dd7c4c61ce74725c2e5e97",
  
    measurementId: "G-D4L2XT3Y9R"
  
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
