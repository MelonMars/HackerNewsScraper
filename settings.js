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

            function createListItem(itemName, item) {
                const li = document.createElement("li");
                console.log(itemName);
                console.log(item.type);
                console.log(item.length);
                li.textContent = itemName;
                li.classList.add(item.type);
                if (item.type === 'feed') {
                    li.draggable = true;
                }

                if (item.type === 'folder') {
                    const subUl = document.createElement('ul');
                    subUl.classList.add('hidden');
                    li.appendChild(subUl);

                    li.addEventListener('click', (event) => {
                        event.stopPropagation();
                        subUl.classList.toggle('hidden');
                    });

                    // Create list items for folder contents
                    if (item.feeds) {
                        item.feeds.forEach(subItem => {
                            const subItemName = subItem.feed || subItem.folder;
                            const subLi = createListItem(subItemName, subItem);
                            subUl.appendChild(subLi);
                        });
                    }

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

                            const feedName = draggedItem.textContent;
                            const feedUrl = feeds[feedName][0].feed;
                            const updatedFeeds = { ...feeds };

                            Object.keys(updatedFeeds).forEach(key => {
                                updatedFeeds[key] = updatedFeeds[key].filter(item => !(item.type === 'feed' && item.feed === feedUrl));
                                if (updatedFeeds[key].length === 0) {
                                    delete updatedFeeds[key];
                                }
                            });

                            if (!updatedFeeds[itemName]) {
                                updatedFeeds[itemName] = [];
                            }

                            const targetFolder = updatedFeeds[itemName].find(item => item.type === 'folder');
                            if (targetFolder) {
                                targetFolder.feed[feedName] = { feed: feedUrl, type: 'feed' };
                            } else {
                                updatedFeeds[itemName].push({
                                    feed: { [feedName]: { feed: feedUrl, type: 'feed' } },
                                    type: 'folder'
                                });
                            }

                            try {
                                await updateDoc(doc(db, 'userData', user.uid), { feeds: updatedFeeds });
                            } catch (error) {
                                console.error('Error updating document:', error);
                            }




                            draggedItem.remove();

                            const newSubLi = createListItem(draggedItem.textContent, {
                                feed: feedUrl,
                                type: 'feed'
                            });
                            subUl.appendChild(newSubLi);
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

                return li;
            }
            feedList.innerHTML = '';

            Object.keys(feeds).forEach(feedName => {
                const items = feeds[feedName];
                if (items.length === 0) {
                    feedList.appendChild(createListItem(feedName, { type: 'folder', feeds: [] }));
                } else {
                    items.forEach(item => {
                        const listItem = createListItem(feedName, item);
                        feedList.appendChild(listItem);
                    });
                }
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