// auth.js - Authentication and Search Logic

document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("user_id");
    const username = localStorage.getItem("username");

    // 1. Navbar Update logic
    const authContainer = document.getElementById("auth-buttons-container");
    const profileContainer = document.getElementById("user-profile-container");
    const welcomeMsg = document.getElementById("welcome-message");

    if (username) {
        if (authContainer) authContainer.style.display = "none";
        if (profileContainer) profileContainer.style.display = "flex";
        if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${username}`;
    } else {
        if (authContainer) authContainer.style.display = "flex";
        if (profileContainer) profileContainer.style.display = "none";
    }

    // 2. Global Search Logic
    const searchInput = document.querySelector('.search-bar input');
    const searchIcon = document.querySelector('.search-bar i.fa-search');

    if (searchInput && searchIcon) {
        const handleSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                const path = window.location.pathname.toLowerCase();
                const isInsideHTML = path.includes('/html/');
                let searchPath = isInsideHTML ? "search_results.html" : "HTML/search_results.html";

                // Adjustment for different folder depths
                const subfolders = ['/snacks/', '/breakfast/', '/lunch/', '/diner/', '/shops/'];
                for (const folder of subfolders) {
                    if (path.includes(folder)) {
                        searchPath = "../search_results.html";
                        break;
                    }
                }

                window.location.href = `${searchPath}?search=${encodeURIComponent(query)}`;
            }
        };

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        searchIcon.addEventListener('click', handleSearch);
    }
});

// Logout functionality
function logout() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("cart");

    const path = window.location.pathname.toLowerCase();
    const isInsideHTML = path.includes('/html/');
    let loginPath = isInsideHTML ? "Login.html" : "HTML/Login.html";

    // Adjustment for different folder depths
    const subfolders = ['/snacks/', '/breakfast/', '/lunch/', '/diner/', '/shops/'];
    for (const folder of subfolders) {
        if (path.includes(folder)) {
            loginPath = "../Login.html";
            break;
        }
    }

    window.location.href = loginPath;
}
