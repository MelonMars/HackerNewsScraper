import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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
const db = getFirestore(app)

onAuthStateChanged(auth, async (user) => {
    if (user) {

        try {
            const dataSnapshot = await getDoc(doc(db, 'userData', user.uid));
            const data = dataSnapshot.data();
            const feeds = data.feeds;
            console.log(feeds);
            const feedList = document.getElementById("feedList");
            feeds.forEach((feed) => {
                    const li = document.createElement("li");
                    li.textContent = feed;
                    feedList.appendChild(li);
            });
        } catch (e) {
            console.log(e);
        }
    } else {
        window.location.href = "auth.html";
    }
});