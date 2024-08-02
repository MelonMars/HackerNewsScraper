import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, getDoc, doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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

function addFeedRightMenu() {
    const targets = document.querySelectorAll('.feedItem');
    const customMenu = document.getElementById('feedMenu');

    targets.forEach(target => {
        target.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            customMenu.style.top = `${e.pageY}px`;
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.display = 'block';
        });
    });

    document.addEventListener('click', function(e) {
        if (!customMenu.contains(e.target)) {
            customMenu.style.display = 'none';
        }
    });
}

function renderFeedsAndFolders(feeds, feedList) {
    feedList.innerHTML = '';

    for (const key in feeds) {
        const items = feeds[key];
        const isFolder = items[0].type === 'folder';

        if (isFolder) {
            const folderItem = document.createElement('li');
            folderItem.classList.add("feedItem");
            folderItem.textContent = key;
            folderItem.setAttribute('data-type', 'folder');
            folderItem.setAttribute('draggable', 'true');
            folderItem.setAttribute('data-name', key);
            folderItem.style.cursor = 'pointer';

            const subList = document.createElement('ul');
            subList.setAttribute('data-folder', key);
            subList.style.display = 'none';

            for (const subKey in items[0].feeds) {
                const feedItem = document.createElement('li');
                feedItem.textContent = subKey;
                feedItem.setAttribute('data-type', 'feed');
                feedItem.setAttribute('draggable', 'true');
                feedItem.setAttribute('data-name', subKey);

                subList.appendChild(feedItem);
            }

            folderItem.appendChild(subList);
            feedList.appendChild(folderItem);

            folderItem.addEventListener('click', function() {
                if (subList.style.display === 'none') {
                    subList.style.display = 'block';
                } else {
                    subList.style.display = 'none';
                }
            });
        } else {
            const feedItem = document.createElement('li');
            feedItem.classList.add("feedItem");
            feedItem.textContent = key;
            feedItem.setAttribute('data-type', 'feed');
            feedItem.setAttribute('draggable', 'true');
            feedItem.setAttribute('data-name', key);

            feedList.appendChild(feedItem);
        }
    }
}

function collapseListButton(feeds, feedList) {
    document.getElementById('listToggleBtn').addEventListener('click', function () {
        const listItems = document.querySelectorAll('#feedList li');
        console.log(listItems);
        const isCollapsed = listItems[3].classList.contains('hidden');
        console.log(isCollapsed);
        listItems.forEach((item, index) => {
            if (index >= 3) {
                item.classList.toggle('hidden', !isCollapsed);
            }
        });

        this.textContent = isCollapsed ? 'Collapse List!' : 'Expand List';
        renderFeedsAndFolders(feeds, feedList)
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {

        try {
            const listSpinner = document.getElementById('feedListSpinner');
            listSpinner.style.display = 'block';
            const dataSnapshot = await getDoc(doc(db, 'userData', user.uid));
            const data = dataSnapshot.data();
            const feeds = data.feeds;
            console.log(feeds)
            const feedList = document.getElementById('feedList');

            listSpinner.style.display = 'none';
            renderFeedsAndFolders(feeds, feedList);
            addFeedRightMenu();
            collapseListButton(feeds, feedList);
            let draggedItem = null;

            document.addEventListener('dragstart', function(event) {
                draggedItem = event.target;
                event.target.style.opacity = 0.5;
            });

            document.addEventListener('dragend', function(event) {
                event.target.style.opacity = '';
            });

            document.addEventListener('dragover', function(event) {
                event.preventDefault();
            });

            document.addEventListener('dragenter', function(event) {
                if (event.target.nodeName === 'LI' && event.target.getAttribute('data-type') === 'folder') {
                    event.target.style.background = 'lightblue';
                }
            });

            document.addEventListener('dragleave', function(event) {
                if (event.target.nodeName === 'LI' && event.target.getAttribute('data-type') === 'folder') {
                    event.target.style.background = '';
                }
            });

            document.addEventListener('drop', function(event) {
                event.preventDefault();
                if (event.target.nodeName === 'LI' && event.target.getAttribute('data-type') === 'folder') {
                    event.target.style.background = '';
                    const folderName = event.target.getAttribute('data-name');
                    const feedName = draggedItem.getAttribute('data-name');

                    console.log(`Dropped ${feedName} into ${folderName}`);

                    moveFeedToFolder(user.uid, feedName, folderName).then(() => {
                        const subList = event.target.querySelector('ul');
                        subList.appendChild(draggedItem);
                        console.log(`Successfully moved ${feedName} into ${folderName}`);
                    }).catch((error) => {
                        console.error('Error moving feed:', error);
                    });
                }
            });


            async function moveFeedToFolder(userId, feedName, folderName) {
                console.log(`Moving feed ${feedName} to folder ${folderName}`);

                const userRef = doc(db, 'userData', userId);
                const userSnapshot = await getDoc(userRef);
                const userData = userSnapshot.data();
                console.log('Current user data:', userData);
                if (userData.feeds[feedName]) {
                    const feedData = userData.feeds[feedName];
                    console.log('Feed data to move:', feedData);
                    delete userData.feeds[feedName];
                    console.log('User data after deletion:', userData);
                    const folder = userData.feeds[folderName][0];
                    if (!folder.feeds) {
                        folder.feeds = {};
                    }
                    folder.feeds[feedName] = feedData;
                    console.log('User data after adding to folder:', userData);
                    await setDoc(userRef, userData);
                    console.log('Firestore updated successfully');
                } else {
                    console.log(`Feed ${feedName} does not exist in the root`);
                }
            }


        } catch (e) {
            console.error(e);
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
    let feedUrl = prompt("Enter a feed url");

    const response = await fetch("http://127.0.0.1:1235/checkFeed/?feed=" + feedUrl);
    feedUrl = await response.json();
    feedUrl = JSON.parse(feedUrl);
    if (feedUrl.response === "BOZO") {
        alert("INVALID FEED URL");
    } else {
        feedUrl = feedUrl.response;
        const dataSnapshot = await getDoc(doc(db, 'userData', auth.currentUser.uid));
        const updates = {}
        updates[`feeds.${feedTitle}`] = [{feed: feedUrl, type: "feed"}];
        updateDoc(dataSnapshot.ref, updates)
        const data = dataSnapshot.data();
        const feeds = data.feeds;
        console.log(feeds)
        const feedList = document.getElementById('feedList');

        renderFeedsAndFolders(feeds, feedList);
    }
}

async function addFolder() {
    const folderTitle = prompt("Enter a folder title");

    const dataSnapshot = await getDoc(doc(db, 'userData', auth.currentUser.uid));
    const updates = {};
    updates[`feeds.${folderTitle}`] = [{ feeds: {}, type: "folder" }];
    await updateDoc(dataSnapshot.ref, updates);
    const data = dataSnapshot.data();
    const feeds = data.feeds;
    console.log(feeds)
    const feedList = document.getElementById('feedList');

    renderFeedsAndFolders(feeds, feedList);
}

window.contentAdd = contentAdd;
window.addFeed = addFeed;
window.addFolder = addFolder;
