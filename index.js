const linkTemplate = document.getElementById("linkTemplate");
const linkContainer = document.getElementById("linkContainer");
const loadingSpinner = document.getElementById('loadingSpinner');
const colorToggle = document.getElementById("colorToggle");

let pageNumber = 0
let loading = false;

async function makeMainPage() {
    const linksPerPage = 10;
    if (loading) return;
    loading = true;
    loadingSpinner.style.display = 'block';
    try {
        const response = await fetch("http://127.0.0.1:8000/links/?page=" + pageNumber);
        let data = await response.json();
        data = JSON.parse(data);
        for (var key of Object.keys(data)) {
            const clone = document.importNode(linkTemplate.content, true);
            const titleElem = clone.querySelector('.Title');
            const linkElem = clone.querySelector(".titleLink")
            titleElem.textContent = key;
            linkElem.href = data[key];
            linkContainer.appendChild(clone);
        }
        pageNumber++;
    } catch (error) {
        console.error(error);
    } finally {
        loading = false;
        loadingSpinner.style.display = 'none';
    }
}

function onScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        makeMainPage();
    }
}

function toggleColor() {
    const toggleElem = document.getElementById("colorToggle");
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('lightMode', 'enabled');
        toggleElem.innerText = "🌑";
    } else {
        localStorage.setItem('lightMode', 'disable');
        toggleElem.innerText = "☀️";
    }
}

makeMainPage();

window.addEventListener('scroll', onScroll);

colorToggle.addEventListener('click', toggleColor);
if (localStorage.getItem('lightMode') === 'enabled') {
    document.body.classList.add('light-mode');
}