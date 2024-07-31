import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js"
import { collection, addDoc, getFirestore, getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js"

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
const db = getFirestore(app);

auth.languageCode = 'en';

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in");
        const loggedOutButtons = document.querySelectorAll('.loggedOut');
        loggedOutButtons.forEach(loggedOutButton => {
            loggedOutButton.style.display = "none";
        })
        const loggedInButtons = document.querySelectorAll('.loggedIn');
        loggedInButtons.forEach(loggedInButton => {
            loggedInButton.style.display = "block";
        })
        const logoutButton = document.getElementById('logout');
        logoutButton.addEventListener('click', e => {
            auth.signOut()
            console.log('Logged out');
        });
    } else {
        const loggedOutButtons = document.querySelectorAll('.loggedOut');
        loggedOutButtons.forEach(loggedOutButton => {
            loggedOutButton.style.display = "block";
        })
        const loggedInButtons = document.querySelectorAll('.loggedIn');
        loggedInButtons.forEach(loggedInButton => {
            loggedInButton.style.display = "none";
        })
        const googleProvider = new GoogleAuthProvider();

        const googleLogin = document.getElementById('google-login-btn');
        googleLogin.addEventListener('click', function(){
            signInWithPopup(auth, googleProvider)
                .then(async (result) => {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const user = result.user;
                    const userId = user.uid;

                    const docRef = doc(db, "userData", userId);
                    const docSnap = await getDoc(docRef);

                    if (!docSnap.exists()) {
                        try {
                            await setDoc(docRef, {
                                name: user.displayName,
                                feeds: []
                            })
                        } catch (e) {
                            console.log("Error creating document", e)
                        }
                    } else {
                        console.log("User already exists, just logging in again!");
                    }
                }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
            });

        })
    }
});