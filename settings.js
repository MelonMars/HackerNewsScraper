import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkoQkl9adRsW67H_jT7bWpH9QDRU44wS4",
    authDomain: "linkaggregator-bb44b.firebaseapp.com",
    projectId: "linkaggregator-bb44b",
    storageBucket: "linkaggregator-bb44b.appspot.com",
    messagingSenderId: "99431625311",
    appId: "1:99431625311:web:bac65091e8c76f72faa1ea",
    measurementId: "G-6R2MPDR718"
};

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in");
    } else {
        window.location.href = "auth.html";
    }
});