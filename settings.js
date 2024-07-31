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
                const items = feeds[feed];
                items.forEach((item) => {
                    const li = document.createElement("li");
                    li.textContent = item.type === 'feed' ? `${feed}: ${item.feed}` : feed;
                    li.classList.add(item.type);
                    li.draggable = item.type === 'feed';

                    if (item.type === 'folder') {
                        const subUl = document.createElement('ul');
                        subUl.classList.add('hidden');
                        li.appendChild(subUl);
                        li.addEventListener('click', () => {
                            subUl.classList.toggle('hidden');
                        });

                        Object.keys(item.feeds).forEach(subFeed => {
                            const subLi = document.createElement('li');
                            subLi.textContent = subFeed;
                            subLi.classList.add('feed');
                            subLi.draggable = true;
                            subUl.appendChild(subLi);
                        });

                        li.addEventListener('dragover', (event) => {
                            event.preventDefault(); // Allow drop
                            li.classList.add('drag-over');
                        });

                        li.addEventListener('dragleave', () => {
                            li.classList.remove('drag-over');
                        });

                        li.addEventListener('drop', async (event) => {
                            event.preventDefault();
                            li.classList.remove('drag-over');

                            const draggedItem = document.querySelector('.dragging');
                            if (draggedItem) {
                                const feedName = draggedItem.textContent.split(':')[0].trim();
                                const targetFolder = feed;
                                const feedUrl = draggedItem.textContent.split(':')[1]?.trim();

                                const updatedFeeds = {...feeds};
                                Object.keys(updatedFeeds).forEach(key => {
                                    updatedFeeds[key] = updatedFeeds[key].filter(item => !(item.type === 'feed' && item.feeds === feedUrl));
                                });

                                if (!updatedFeeds[targetFolder]) {
                                    updatedFeeds[targetFolder] = [];
                                }
                                updatedFeeds[targetFolder][feedName] = {
                                    feeds: feedUrl,
                                    type: 'feed'
                                };

                                await updateDoc(doc(db, 'userData', user.uid), {feeds: updatedFeeds});

                                draggedItem.remove();

                                const newSubLi = document.createElement('li');
                                newSubLi.textContent = draggedItem.textContent.split(':')[1].trim();
                                newSubLi.classList.add('feed');
                                newSubLi.draggable = true;
                                li.querySelector('ul').appendChild(newSubLi);
                            }
                        });

                    } else if (item.type === 'feed') {
                        li.addEventListener('dragstart', () => {
                            li.classList.add('dragging');
                        });

                        li.addEventListener('dragend', () => {
                            li.classList.remove('dragging');
                        });
                    }

                    feedList.appendChild(li);
                });
            });
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
    updates[`feeds.${feedTitle}`] = [{feed: feedUrl, type: "feed"}];
    updateDoc(dataSnapshot.ref, updates)
}

async function addFolder() {
    const folderTitle = prompt("Enter a folder title");

    const dataSnapshot = await getDoc(doc(db, 'userData', auth.currentUser.uid));
    const updates = {};
    updates[`feeds.${folderTitle}`] = [{ feeds: {}, type: "folder" }];
    await updateDoc(dataSnapshot.ref, updates);
}

async function addFeedToFolder(feedName, feedUrl, folderTitle) {
    const dataSnapshot = await getDoc(doc(db, 'userData', auth.currentUser.uid));
    const updates = {};
    updates[`feeds.${folderTitle}`].feeds.push({feed: feedUrl, type: "feed"});
    await updateDoc(dataSnapshot.ref, updates);
}

window.contentAdd = contentAdd;
window.addFeed = addFeed;
window.addFolder = addFolder;