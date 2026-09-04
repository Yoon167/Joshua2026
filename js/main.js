/* ==========================================================================
   Joshua Bajao Portfolio — interaction engine
   Lenis smooth scroll + GSAP/ScrollTrigger reveals + custom cursor +
   magnetic buttons + typewriter + counters + circular meters + tilt +
   Three.js particle field + project modal + contact form UX
   ========================================================================== */
(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const hasGSAP = typeof window.gsap !== 'undefined';

    document.documentElement.classList.add('js');
    document.documentElement.classList.remove('no-js');

    if (hasGSAP && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ---------------------------------------------------------------------
       Loading screen
       --------------------------------------------------------------------- */
    const loader = document.querySelector('.loader');
    const loaderBar = document.querySelector('.loader-bar span');
    window.addEventListener('load', () => {
        if (loaderBar) loaderBar.style.width = '100%';
        window.setTimeout(() => {
            loader?.classList.add('is-hidden');
            document.body.classList.add('page-ready');
        }, 320);
    });
    // Fallback in case 'load' is slow/blocked
    window.setTimeout(() => {
        if (loaderBar) loaderBar.style.width = '100%';
        loader?.classList.add('is-hidden');
        document.body.classList.add('page-ready');
    }, 2600);

    /* ---------------------------------------------------------------------
       Lenis smooth scroll
       --------------------------------------------------------------------- */
    let lenis = null;
    if (!prefersReducedMotion && !isCoarsePointer && typeof window.Lenis !== 'undefined') {
        lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });

        if (hasGSAP && window.ScrollTrigger) {
            // Let GSAP's ticker drive Lenis so both stay in sync on one RAF loop.
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (time) => {
                lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }
    }

    /* ---------------------------------------------------------------------
       Custom cursor
       --------------------------------------------------------------------- */
    if (!isCoarsePointer) {
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        const ring = document.createElement('div');
        ring.className = 'cursor-ring';
        document.body.append(dot, ring);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener('mousemove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;
            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateRing);
        };
        requestAnimationFrame(animateRing);

        const interactiveSelector = 'a, button, .button, input, textarea, select, [data-magnetic], .mini-project, .feature-card, .tech-card, .skill-card';
        document.addEventListener('mouseover', (event) => {
            if (event.target.closest(interactiveSelector)) ring.classList.add('is-active');
        });
        document.addEventListener('mouseout', (event) => {
            if (event.target.closest(interactiveSelector)) ring.classList.remove('is-active');
        });
    }

    /* ---------------------------------------------------------------------
       Mouse-following glow (hero + panels with .mouse-glow)
       --------------------------------------------------------------------- */
    document.querySelectorAll('.mouse-glow').forEach((panel) => {
        panel.addEventListener('pointermove', (event) => {
            const bounds = panel.getBoundingClientRect();
            panel.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
            panel.style.setProperty('--my', `${event.clientY - bounds.top}px`);
        });
    });

    /* ---------------------------------------------------------------------
       Feature/tech/skill card local spotlight (radial highlight on hover)
       --------------------------------------------------------------------- */
    document.querySelectorAll('.feature-card').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const bounds = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
            card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
        });
    });

    /* ---------------------------------------------------------------------
       Magnetic buttons
       --------------------------------------------------------------------- */
    if (!isCoarsePointer && !prefersReducedMotion) {
        document.querySelectorAll('[data-magnetic], .button').forEach((el) => {
            el.addEventListener('pointermove', (event) => {
                const bounds = el.getBoundingClientRect();
                const relX = event.clientX - bounds.left - bounds.width / 2;
                const relY = event.clientY - bounds.top - bounds.height / 2;
                el.style.transform = `translate(${relX * 0.22}px, ${relY * 0.3}px)`;
            });
            el.addEventListener('pointerleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ---------------------------------------------------------------------
       3D tilt on cards (.hero-card, .tech-card, .skill-card)
       --------------------------------------------------------------------- */
    if (!isCoarsePointer && !prefersReducedMotion) {
        document.querySelectorAll('.hero-card, .tech-card, .skill-card').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const bounds = card.getBoundingClientRect();
                const px = (event.clientX - bounds.left) / bounds.width - 0.5;
                const py = (event.clientY - bounds.top) / bounds.height - 0.5;
                card.style.setProperty('--tilt-x', `${py * -6}deg`);
                card.style.setProperty('--tilt-y', `${px * 8}deg`);
            });
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
            });
        });
    }

    /* ---------------------------------------------------------------------
       Navbar: scroll state, hide-on-scroll-down, mobile toggle, scrollspy
       --------------------------------------------------------------------- */
    const topbar = document.querySelector('.topbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navPanel = document.querySelector('.nav-panel');
    const navLinks = document.querySelectorAll('.nav-link');

    let lastScroll = window.scrollY;
    const onScroll = () => {
        const current = window.scrollY;
        topbar?.classList.toggle('is-scrolled', current > 30);
        if (current > lastScroll && current > 200) {
            topbar?.classList.add('is-hidden');
        } else {
            topbar?.classList.remove('is-hidden');
        }
        lastScroll = current;
        updateScrollIndicator();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (navToggle && navPanel) {
        navToggle.addEventListener('click', () => {
            const isOpen = navPanel.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                navPanel.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------------------------------------------------------------------
       Scroll progress bar
       --------------------------------------------------------------------- */
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.setAttribute('aria-hidden', 'true');
    document.body.append(scrollIndicator);

    function updateScrollIndicator() {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        scrollIndicator.style.transform = `scaleX(${Math.min(progress, 100) / 100})`;
    }

    /* ---------------------------------------------------------------------
       Scroll reveal animations (GSAP ScrollTrigger, with IO fallback)
       --------------------------------------------------------------------- */
    const reveals = document.querySelectorAll('.reveal');

    if (hasGSAP && window.ScrollTrigger && !prefersReducedMotion) {
        reveals.forEach((el) => {
            const direction = el.dataset.reveal || 'up';
            const from = {
                up: { y: 48, opacity: 0 },
                down: { y: -48, opacity: 0 },
                left: { x: -56, opacity: 0 },
                right: { x: 56, opacity: 0 },
                scale: { scale: 0.9, opacity: 0 },
            }[direction] || { y: 48, opacity: 0 };

            gsap.fromTo(el, from, {
                y: 0, x: 0, scale: 1, opacity: 1,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true,
                },
            });
        });
    } else if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-static');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        reveals.forEach((el) => revealObserver.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('is-static'));
    }

    /* Staggered children within a container marked [data-stagger] */
    if (hasGSAP && window.ScrollTrigger && !prefersReducedMotion) {
        document.querySelectorAll('[data-stagger]').forEach((group) => {
            const items = group.children;
            gsap.fromTo(items, { y: 32, opacity: 0 }, {
                y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.09,
                scrollTrigger: { trigger: group, start: 'top 85%', once: true },
            });
        });
    }

    /* ---------------------------------------------------------------------
       Typewriter effect (roles)
       --------------------------------------------------------------------- */
    const typeTarget = document.querySelector('[data-typewriter]');
    if (typeTarget) {
        let roles = [];
        try {
            roles = JSON.parse(typeTarget.dataset.typewriter);
        } catch (err) {
            roles = [typeTarget.textContent.trim()];
        }
        let roleIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const tick = () => {
            const currentRole = roles[roleIndex];
            if (!deleting) {
                charIndex += 1;
                typeTarget.textContent = currentRole.slice(0, charIndex);
                if (charIndex === currentRole.length) {
                    deleting = true;
                    window.setTimeout(tick, 1500);
                    return;
                }
            } else {
                charIndex -= 1;
                typeTarget.textContent = currentRole.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
            }
            window.setTimeout(tick, deleting ? 35 : 65);
        };

        if (prefersReducedMotion) {
            typeTarget.textContent = roles[0];
        } else {
            window.setTimeout(tick, 500);
        }
    }

    /* ---------------------------------------------------------------------
       Animated counters
       --------------------------------------------------------------------- */
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.dataset.counter);
                const suffix = el.dataset.suffix || '';
                const duration = prefersReducedMotion ? 0 : 1600;
                const start = performance.now();

                const step = (now) => {
                    const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const value = Math.round(target * eased);
                    el.textContent = value.toLocaleString() + suffix;
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                observer.unobserve(el);
            });
        }, { threshold: 0.4 });
        counters.forEach((el) => counterObserver.observe(el));
    }

    /* ---------------------------------------------------------------------
       Progress bars (skills page)
       --------------------------------------------------------------------- */
    const progressBars = document.querySelectorAll('.progress-track span');
    if (progressBars.length > 0 && 'IntersectionObserver' in window) {
        const progressObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.width = entry.target.dataset.width;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.35 });
        progressBars.forEach((bar) => {
            bar.dataset.width = bar.style.width;
            bar.style.width = '0';
            progressObserver.observe(bar);
        });
    }

    /* ---------------------------------------------------------------------
       Circular skill meters
       --------------------------------------------------------------------- */
    const meters = document.querySelectorAll('.meter-value');
    if (meters.length > 0 && 'IntersectionObserver' in window) {
        const meterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const circle = entry.target;
                const percent = parseFloat(circle.dataset.percent || '0');
                const circumference = 339.3;
                const offset = circumference - (percent / 100) * circumference;
                circle.style.strokeDashoffset = String(offset);
                observer.unobserve(circle);
            });
        }, { threshold: 0.4 });
        meters.forEach((m) => meterObserver.observe(m));
    }

    /* ---------------------------------------------------------------------
       Project modal
       --------------------------------------------------------------------- */
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        const modalPanel = modalOverlay.querySelector('.modal-panel');
        const modalClose = modalOverlay.querySelector('.modal-close');
        const modalTriggers = document.querySelectorAll('[data-modal-trigger]');

        const openModal = (trigger) => {
            const { modalTitle, modalDesc, modalImg, modalTags } = trigger.dataset;
            modalPanel.querySelector('img').src = modalImg || '';
            modalPanel.querySelector('h3').textContent = modalTitle || '';
            modalPanel.querySelector('p').textContent = modalDesc || '';
            const tagWrap = modalPanel.querySelector('.project-badges');
            if (tagWrap) {
                tagWrap.innerHTML = '';
                (modalTags || '').split(',').filter(Boolean).forEach((tag) => {
                    const span = document.createElement('span');
                    span.textContent = tag.trim();
                    tagWrap.append(span);
                });
            }
            modalOverlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        };
        const closeModal = () => {
            modalOverlay.classList.remove('is-open');
            document.body.style.overflow = '';
        };

        modalTriggers.forEach((trigger) => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                openModal(trigger);
            });
        });
        modalClose?.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) closeModal();
        });
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeModal();
        });
    }

    /* ---------------------------------------------------------------------
       Contact form: floating labels + light validation UX
       (submission handled by firebase.js)
       --------------------------------------------------------------------- */
    document.querySelectorAll('.field input, .field textarea').forEach((input) => {
        const field = input.closest('.field');
        const syncState = () => field.classList.toggle('is-filled', input.value.trim().length > 0);
        input.addEventListener('input', () => {
            syncState();
            field.classList.remove('is-invalid');
        });
        input.addEventListener('blur', () => {
            syncState();
            if (input.required && !input.value.trim()) field.classList.add('is-invalid');
        });
        syncState();
    });

    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', () => {
            form.querySelectorAll('.field').forEach((field) => {
                const input = field.querySelector('input, textarea');
                if (input?.required && !input.value.trim()) field.classList.add('is-invalid');
            });
        }, true);
    });

    /* ---------------------------------------------------------------------
       Page transition on internal navigation
       --------------------------------------------------------------------- */
    document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
            const destination = link.href;
            if (new URL(destination).origin !== window.location.origin || destination === window.location.href) return;
            event.preventDefault();
            document.body.classList.add('page-leaving');
            window.setTimeout(() => { window.location.href = destination; }, 200);
        });
    });

    /* ---------------------------------------------------------------------
       Three.js subtle particle field (hero background)
       --------------------------------------------------------------------- */
    const particleCanvas = document.querySelector('[data-particle-field]');
    if (particleCanvas && typeof window.THREE !== 'undefined' && !prefersReducedMotion && !isCoarsePointer) {
        try {
            const renderer = new THREE.WebGLRenderer({ canvas: particleCanvas, alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(60, particleCanvas.clientWidth / particleCanvas.clientHeight, 0.1, 100);
            camera.position.z = 22;

            const count = 260;
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i += 1) {
                positions[i * 3] = (Math.random() - 0.5) * 42;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.09, transparent: true, opacity: 0.75 });
            const points = new THREE.Points(geometry, material);
            scene.add(points);

            let targetX = 0;
            let targetY = 0;
            window.addEventListener('mousemove', (event) => {
                targetX = (event.clientX / window.innerWidth - 0.5) * 0.6;
                targetY = (event.clientY / window.innerHeight - 0.5) * 0.6;
            });

            const resize = () => {
                const { clientWidth, clientHeight } = particleCanvas;
                renderer.setSize(clientWidth, clientHeight, false);
                camera.aspect = clientWidth / clientHeight;
                camera.updateProjectionMatrix();
            };
            resize();
            window.addEventListener('resize', resize);

            const animate = () => {
                points.rotation.y += 0.0009;
                points.rotation.x += 0.0002;
                camera.position.x += (targetX - camera.position.x) * 0.02;
                camera.position.y += (-targetY - camera.position.y) * 0.02;
                camera.lookAt(scene.position);
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            };
            animate();
        } catch (err) {
            console.warn('Particle field disabled:', err);
        }
    }
})();
