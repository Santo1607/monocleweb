document.addEventListener('DOMContentLoaded', () => {
    // Loader
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1000);
    }

    // Navbar Injection
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.innerHTML = `
            <div class="nav-container">
                <a href="index.html" class="nav-logo">MONOCLE'26</a>
                <div class="nav-links">
                    <a href="index.html">Home</a>
                    <a href="events.html">Events</a>
                    <a href="index.html#about">About</a>
                    <a href="index.html#works">Works</a>
                </div>
                <div class="nav-menu-btn">☰</div>
            </div>
        `;
    }
});
