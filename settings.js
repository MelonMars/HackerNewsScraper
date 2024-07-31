import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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
            Object.keys(feeds).forEach((feed) => {
                    if (feeds[feed][1] === "feed") {
                        const li = document.createElement("li");
                        li.textContent = feed;
                        feedList.appendChild(li);
                    } else if (feeds[feed][1] === "folder") {
                        const li = document.createElement("li");
                        li.textContent = ">" + feed;
                        feedList.appendChild(li);
                    }
            });

            const listToggleBtn = document.getElementById("listToggleBtn");
            let isExpanded = true;

            function updateFeedVis() {
                const lstItems = feedList.children;
                for (let i=0;i<lstItems.length;i++) {
                    if (isExpanded || i < 3) {
                        lstItems[i].classList.remove("hidden");
                    } else {
                        lstItems[i].classList.add("hidden");
                    }
                }
            }
            listToggleBtn.textContent = isExpanded ? "Collapse All" : "Expand All";

            listToggleBtn.addEventListener("click", () => {
                isExpanded = !isExpanded;
                updateFeedVis();
            });

            isExpanded = false;
            updateFeedVis();
        } catch (e) {
            console.log(e);
        }
    } else {
        window.location.href = "auth.html";
    }
});

function contentAdd() {
    const widget = document.getElementById("feedAddWidget");
    console.log("Feed adding");
    widget.classList.toggle("show");
}

async function addFeed() {
    const feedTitle = prompt("Enter a feed title");
    const feedUrl = prompt("Enter a feed url");

    const dataSnapshot = await getDoc(doc(db, 'userData', auth.currentUser.uid));
    const updates = {}
    updates[`feeds.${feedTitle}`] = [feedUrl, "feed"];
    updateDoc(dataSnapshot.ref, updates)
}

async function addFolder() {
    const folderTitle = prompt("Enter a folder title");

    const dataSnapshot = await getDoc(doc(db, 'userData', auth.currentUser.uid));
    const updates = {};
    updates[`feeds.${folderTitle}`] = [{ feeds: [], type: "folder" }];
    await updateDoc(dataSnapshot.ref, updates);
}

window.contentAdd = contentAdd;
window.addFeed = addFeed;
window.addFolder = addFolder;