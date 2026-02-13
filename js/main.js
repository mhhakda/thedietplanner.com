// TheDietPlanner - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initNewsletterForm();
    initHeroSlider();
});

// Hero Slider
function initHeroSlider() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const track = slider.querySelector('.hero-track');
    const slides = slider.querySelectorAll('.hero-slide');
    const dots = slider.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    const progressBar = document.getElementById('heroProgress');

    let current = 0;
    const total = slides.length;
    const INTERVAL = 5000; // 5 seconds per slide
    let autoplayTimer = null;
    let progressTimer = null;
    let progressStart = 0;
    let paused = false;

    function goTo(index) {
        const prevIndex = current;
        current = ((index % total) + total) % total; // wrap around

        // GSAP exit animation on outgoing slide (if GSAP available)
        if (prevIndex !== current && typeof window.createSlideExitTimeline === 'function') {
            const exitTl = window.createSlideExitTimeline(slides[prevIndex]);
            if (exitTl) {
                exitTl.then(() => {
                    slides[prevIndex].classList.remove('active');
                });
            }
        }

        track.style.transform = `translateX(-${current * 20}%)`;
        slides.forEach(s => s.classList.remove('active'));
        slides[current].classList.add('active');
        dots.forEach(d => d.classList.remove('active'));
        dots[current].classList.add('active');

        // GSAP entrance animation on incoming slide
        if (typeof window.createSlideEntranceTimeline === 'function') {
            window.createSlideEntranceTimeline(slides[current]);
        }

        resetProgress();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Progress bar
    function resetProgress() {
        if (progressBar) progressBar.style.width = '0%';
        progressStart = Date.now();
        clearInterval(progressTimer);
        progressTimer = setInterval(() => {
            if (paused) return;
            const elapsed = Date.now() - progressStart;
            const pct = Math.min((elapsed / INTERVAL) * 100, 100);
            if (progressBar) progressBar.style.width = pct + '%';
        }, 30);
    }

    // Auto-play
    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => {
            if (!paused) next();
        }, INTERVAL);
        resetProgress();
    }

    function stopAutoplay() {
        clearInterval(autoplayTimer);
        clearInterval(progressTimer);
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goTo(parseInt(dot.dataset.dot));
            startAutoplay();
        });
    });

    // Pause on hover (desktop)
    slider.addEventListener('mouseenter', () => { paused = true; });
    slider.addEventListener('mouseleave', () => { paused = false; progressStart = Date.now() - (Date.now() - progressStart); });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        paused = true;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) next(); else prev();
        }
        paused = false;
        startAutoplay();
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
        if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    });

    // Start
    startAutoplay();
}

// Navbar scroll effect
function initNavbar() {
    const navbar = document.getElementById('navbar');

    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbar);
    updateNavbar();
}

// Mobile menu toggle
function initMobileMenu() {
    const toggle = document.getElementById('navbarToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!toggle || !mobileMenu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Newsletter form handling
function initNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        const button = form.querySelector('button');
        const originalText = button.textContent;

        // Show loading state
        button.textContent = 'Sending...';
        button.disabled = true;

        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success
        button.textContent = '✓ Subscribed!';
        button.style.background = 'var(--accent-emerald)';
        form.querySelector('input').value = '';

        // Reset after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 3000);
    });
}

// Contact form handling
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.textContent;

        button.textContent = 'Sending...';
        button.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 1500));

        button.textContent = '✓ Message Sent!';
        button.style.background = 'var(--accent-emerald)';
        form.reset();

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 3000);
    });
}

// Initialize contact form if on contact page
if (document.getElementById('contactForm')) {
    initContactForm();
}
