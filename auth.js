import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js"

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
auth.languageCode = 'en';

onAuthStateChanged(auth, (user) => {
    if (user) {
        const loggedOutButtons = document.querySelectorAll('.loggedOut');
        loggedOutButtons.forEach(loggedOutButton => {
            loggedOutButton.style.display = "none";
        })
        const logoutButton = document.getElementById('logout');
        
    } else {
        const googleProvider = new GoogleAuthProvider();

        const googleLogin = document.getElementById('google-login-btn');
        googleLogin.addEventListener('click', function(){
            signInWithPopup(auth, googleProvider)
                .then((result) => {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const user = result.user;
                }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
            });

        })
    }
});