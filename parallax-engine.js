/**
 * ========================================
 * TheDietPlanner — Parallax Storytelling Engine
 * GSAP + ScrollTrigger powered animations
 * ========================================
 *
 * Each section has a unique animation style:
 *   • Hero Carousel   → Cinematic Reveal (per-slide GSAP timelines)
 *   • Features        → Depth Layer Split (3-speed parallax)
 *   • How It Works     → Horizontal Offset Parallax (alternating slides)
 *   • Testimonials     → Float & Scale Entrance
 *   • CTA             → Zoom Reveal
 *
 * TIMING & EASING REFERENCE (tweak these):
 *   heroEntranceDuration   = 0.6s per element
 *   heroStaggerDelay       = 0.08s between pills
 *   featureCardStagger     = 0.15s between cards
 *   stepStagger            = 0.2s between steps
 *   testimonialStagger     = 0.15s between cards
 *
 * EASING OPTIONS:
 *   "power2.out"      → smooth deceleration (default)
 *   "back.out(1.7)"   → overshoot bounce (buttons)
 *   "elastic.out(1,0.5)" → springy (icons)
 *   "expo.out"        → dramatic slow finish
 */

(function () {
    'use strict';

    // ---- Guard: check if GSAP loaded ----
    if (typeof gsap === 'undefined') {
        console.warn('[Parallax Engine] GSAP not found — falling back to CSS animations');
        document.documentElement.classList.add('no-gsap');
        return;
    }

    // Register ScrollTrigger plugin
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // ---- Configuration (tweak these!) ----
    const CONFIG = {
        // Hero carousel
        hero: {
            entranceDuration: 0.6,     // seconds per element
            staggerDelay: 0.08,        // between pills
            titleRevealDuration: 0.8,
            iconEasing: 'elastic.out(1, 0.5)',
            buttonEasing: 'back.out(1.7)',
            blobParallaxSpeed: 0.3,    // 0 = no move, 1 = full scroll speed
        },
        // Features section
        features: {
            cardStagger: 0.15,
            foregroundSpeed: 1.2,
            midgroundSpeed: 0.9,
            backgroundSpeed: 0.6,
            entranceDuration: 0.7,
        },
        // How It Works
        steps: {
            stagger: 0.2,
            slideDistance: 80,          // px from side
            numberScaleDuration: 0.5,
            lineDrawDuration: 1.2,
        },
        // Testimonials
        testimonials: {
            cardStagger: 0.15,
            floatDistance: 60,
            scaleFactor: 0.85,
            entranceDuration: 0.7,
        },
        // CTA
        cta: {
            scaleFactor: 0.85,
            wordStagger: 0.06,
            entranceDuration: 0.8,
        },
    };

    // ========================================
    // 1. HERO CAROUSEL — Cinematic Reveal
    // ========================================

    /**
     * Creates a GSAP timeline for a single hero slide entrance.
     * Called by the slider's goTo() function.
     */
    window.createSlideEntranceTimeline = function (slideElement) {
        if (!slideElement) return null;

        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        const badge = slideElement.querySelector('.hero-badge');
        const icon = slideElement.querySelector('.hero-slide-icon');
        const title = slideElement.querySelector('.hero-title');
        const subtitle = slideElement.querySelector('.hero-subtitle');
        const pills = slideElement.querySelectorAll('.hero-pill');
        const buttons = slideElement.querySelector('.hero-buttons');

        // Reset all elements first
        gsap.set([badge, icon, title, subtitle, buttons], {
            opacity: 0, clearProps: 'transform,clipPath'
        });
        gsap.set(pills, { opacity: 0, y: 15, scale: 0.9 });

        // Badge: fade in + slide down
        if (badge) {
            tl.to(badge, {
                opacity: 1, y: 0, duration: CONFIG.hero.entranceDuration * 0.7
            }, 0);
            gsap.set(badge, { y: -20 });
        }

        // Icon: elastic scale
        if (icon) {
            gsap.set(icon, { scale: 0.5 });
            tl.to(icon, {
                opacity: 1, scale: 1,
                duration: CONFIG.hero.entranceDuration,
                ease: CONFIG.hero.iconEasing
            }, 0.1);
        }

        // Title: clipPath reveal + slight rotation
        if (title) {
            gsap.set(title, { clipPath: 'inset(0 100% 0 0)', opacity: 0 });
            tl.to(title, {
                clipPath: 'inset(0 0% 0 0)', opacity: 1,
                duration: CONFIG.hero.titleRevealDuration,
                ease: 'expo.out'
            }, 0.15);
        }

        // Subtitle: fade up with delay
        if (subtitle) {
            gsap.set(subtitle, { y: 20 });
            tl.to(subtitle, {
                opacity: 1, y: 0,
                duration: CONFIG.hero.entranceDuration,
            }, 0.35);
        }

        // Pills: staggered entrance
        if (pills.length) {
            tl.to(pills, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.4,
                stagger: CONFIG.hero.staggerDelay,
                ease: 'back.out(1.4)'
            }, 0.45);
        }

        // Button: bounce up
        if (buttons) {
            gsap.set(buttons, { y: 30 });
            tl.to(buttons, {
                opacity: 1, y: 0,
                duration: CONFIG.hero.entranceDuration,
                ease: CONFIG.hero.buttonEasing
            }, 0.55);
        }

        return tl;
    };

    /**
     * Creates exit animation for outgoing slide.
     */
    window.createSlideExitTimeline = function (slideElement) {
        if (!slideElement) return null;

        const tl = gsap.timeline({ defaults: { ease: 'power2.in', duration: 0.3 } });
        const elements = slideElement.querySelectorAll(
            '.hero-badge, .hero-slide-icon, .hero-title, .hero-subtitle, .hero-pills, .hero-buttons'
        );

        tl.to(elements, {
            opacity: 0,
            y: -15,
            stagger: 0.03,
            duration: 0.25
        });

        return tl;
    };

    // Hero blob parallax on scroll
    function initHeroBlobParallax() {
        const blobs = document.querySelectorAll('.blob');
        if (!blobs.length) return;

        blobs.forEach((blob, i) => {
            const direction = i % 2 === 0 ? 1 : -1;
            const speed = CONFIG.hero.blobParallaxSpeed * (1 + i * 0.15);

            gsap.to(blob, {
                y: () => window.innerHeight * speed * direction * 0.5,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5,
                }
            });
        });
    }

    // Hero background parallax (slower horizontal movement)
    function initHeroBgParallax() {
        const heroBg = document.querySelector('.hero-bg');
        if (!heroBg) return;

        gsap.to(heroBg, {
            x: -60,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 2,
            }
        });
    }

    // Animate the first slide on page load
    function animateInitialSlide() {
        const firstSlide = document.querySelector('.hero-slide.active');
        if (firstSlide) {
            setTimeout(() => {
                window.createSlideEntranceTimeline(firstSlide);
            }, 300); // small delay for page paint
        }
    }

    // ========================================
    // 2. FEATURES — Depth Layer Split
    // ========================================

    function initFeaturesParallax() {
        const section = document.querySelector('.features');
        if (!section || typeof ScrollTrigger === 'undefined') return;

        const cards = section.querySelectorAll('.card');
        if (!cards.length) return;

        // Staggered card entrance with depth layers
        cards.forEach((card, i) => {
            const icon = card.querySelector('.card-icon');
            const title = card.querySelector('.card-title');
            const desc = card.querySelector('.card-description');

            // Main card entrance
            gsap.from(card, {
                y: 60,
                opacity: 0,
                duration: CONFIG.features.entranceDuration,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                delay: i * CONFIG.features.cardStagger,
            });

            // Depth layers: each moves at different speed on scroll
            if (icon) {
                gsap.to(icon, {
                    y: -20 * CONFIG.features.foregroundSpeed,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1,
                    }
                });
            }

            if (title) {
                gsap.to(title, {
                    y: -10 * CONFIG.features.midgroundSpeed,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.5,
                    }
                });
            }

            if (desc) {
                gsap.to(desc, {
                    y: -5 * CONFIG.features.backgroundSpeed,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 2,
                    }
                });
            }
        });

        // 3D tilt effect on hover (mouse-tracking)
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(card, {
                    rotateY: x * 10,
                    rotateX: -y * 10,
                    duration: 0.4,
                    ease: 'power2.out',
                    transformPerspective: 800,
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.5)',
                });
            });
        });
    }

    // ========================================
    // 3. HOW IT WORKS — Horizontal Offset Parallax
    // ========================================

    function initStepsParallax() {
        const section = document.querySelector('.how-it-works');
        if (!section || typeof ScrollTrigger === 'undefined') return;

        const steps = section.querySelectorAll('.step');
        const stepsContainer = section.querySelector('.steps');

        // Draw connecting line
        if (stepsContainer) {
            ScrollTrigger.create({
                trigger: stepsContainer,
                start: 'top 70%',
                onEnter: () => stepsContainer.classList.add('line-drawn'),
            });
        }

        steps.forEach((step, i) => {
            const fromLeft = i % 2 === 0;
            const number = step.querySelector('.step-number');
            const title = step.querySelector('.step-title');
            const desc = step.querySelector('.step-description');

            // Step slides in from alternating sides
            gsap.from(step, {
                x: fromLeft ? -CONFIG.steps.slideDistance : CONFIG.steps.slideDistance,
                opacity: 0,
                rotation: fromLeft ? -3 : 3,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: step,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                delay: i * CONFIG.steps.stagger,
            });

            // Step number scales up with elastic
            if (number) {
                gsap.from(number, {
                    scale: 0,
                    opacity: 0,
                    duration: CONFIG.steps.numberScaleDuration,
                    ease: 'elastic.out(1, 0.5)',
                    scrollTrigger: {
                        trigger: step,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                    delay: i * CONFIG.steps.stagger + 0.2,
                });
            }

            // Title and description staggered fade
            if (title) {
                gsap.from(title, {
                    y: 20, opacity: 0, duration: 0.5,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: step, start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                    delay: i * CONFIG.steps.stagger + 0.35,
                });
            }

            if (desc) {
                gsap.from(desc, {
                    y: 20, opacity: 0, duration: 0.5,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: step, start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                    delay: i * CONFIG.steps.stagger + 0.5,
                });
            }
        });
    }

    // ========================================
    // 4. TESTIMONIALS — Float & Scale Entrance
    // ========================================

    function initTestimonialsParallax() {
        const section = document.querySelector('.testimonials');
        if (!section || typeof ScrollTrigger === 'undefined') return;

        const cards = section.querySelectorAll('.testimonial-card');
        const directions = [
            { x: -CONFIG.testimonials.floatDistance, y: 40 },      // card 1: from left
            { x: 0, y: CONFIG.testimonials.floatDistance },         // card 2: from bottom
            { x: CONFIG.testimonials.floatDistance, y: 40 },       // card 3: from right
        ];

        cards.forEach((card, i) => {
            const dir = directions[i % directions.length];
            const quote = card.querySelector('.testimonial-text');
            const avatar = card.querySelector('.testimonial-avatar');
            const stars = card.querySelectorAll('.testimonial-stars svg');

            // Card floats in from unique direction
            gsap.from(card, {
                x: dir.x,
                y: dir.y,
                opacity: 0,
                scale: CONFIG.testimonials.scaleFactor,
                duration: CONFIG.testimonials.entranceDuration,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                delay: i * CONFIG.testimonials.cardStagger,
            });

            // Quote reveal with clipPath
            if (quote) {
                gsap.from(quote, {
                    clipPath: 'inset(0 0 100% 0)',
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                    delay: i * CONFIG.testimonials.cardStagger + 0.3,
                });
            }

            // Avatar spin + scale
            if (avatar) {
                gsap.from(avatar, {
                    scale: 0,
                    rotation: -180,
                    duration: 0.6,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                    delay: i * CONFIG.testimonials.cardStagger + 0.4,
                });
            }

            // Stars fill sweep
            if (stars.length) {
                gsap.from(stars, {
                    scale: 0,
                    opacity: 0,
                    stagger: 0.08,
                    duration: 0.3,
                    ease: 'back.out(2)',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                    delay: i * CONFIG.testimonials.cardStagger + 0.15,
                });
            }
        });
    }

    // ========================================
    // 5. CTA — Zoom Reveal
    // ========================================

    function initCTAParallax() {
        const section = document.querySelector('.cta');
        if (!section || typeof ScrollTrigger === 'undefined') return;

        const card = section.querySelector('.cta-card');
        const headline = section.querySelector('h2');
        const paragraph = section.querySelector('.cta-content > p');
        const form = section.querySelector('.cta-form');
        const button = section.querySelector('.cta-form button');

        if (card) {
            gsap.from(card, {
                scale: CONFIG.cta.scaleFactor,
                opacity: 0,
                duration: CONFIG.cta.entranceDuration,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            });
        }

        // Headline word-by-word animation (SplitText approach)
        if (headline) {
            const words = headline.textContent.split(' ');
            headline.innerHTML = words.map(w => `<span class="cta-word" style="display:inline-block">${w}&nbsp;</span>`).join('');
            const wordSpans = headline.querySelectorAll('.cta-word');

            gsap.from(wordSpans, {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: CONFIG.cta.wordStagger,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                delay: 0.2,
            });
        }

        if (paragraph) {
            gsap.from(paragraph, {
                y: 20, opacity: 0, duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card, start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                delay: 0.5,
            });
        }

        // Form slides in from right
        if (form) {
            gsap.from(form, {
                x: 50, opacity: 0, duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card, start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                delay: 0.6,
            });
        }

        // Button pulse after entrance
        if (button) {
            ScrollTrigger.create({
                trigger: card,
                start: 'top 80%',
                onEnter: () => {
                    setTimeout(() => {
                        gsap.fromTo(button,
                            { scale: 1 },
                            { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' }
                        );
                    }, 1200);
                }
            });
        }
    }

    // ========================================
    // Section Header Animations (shared)
    // ========================================

    function initSectionHeaders() {
        if (typeof ScrollTrigger === 'undefined') return;

        const headers = document.querySelectorAll('.section-header');
        headers.forEach(header => {
            const overline = header.querySelector('.overline');
            const h2 = header.querySelector('h2');
            const p = header.querySelector('p');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                }
            });

            if (overline) {
                tl.from(overline, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0);
            }
            if (h2) {
                tl.from(h2, { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.1);
            }
            if (p) {
                tl.from(p, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.25);
            }
        });
    }

    // ========================================
    // Initialize Everything
    // ========================================

    function init() {
        // Remove no-gsap fallback class since GSAP loaded successfully
        document.documentElement.classList.remove('no-gsap');

        // Hero
        initHeroBlobParallax();
        initHeroBgParallax();
        animateInitialSlide();

        // Sections
        initSectionHeaders();
        initFeaturesParallax();
        initStepsParallax();
        initTestimonialsParallax();
        initCTAParallax();

        console.log('[Parallax Engine] Initialized — GSAP', gsap.version);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
