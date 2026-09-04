/* ==========================================================================
   Joshua Bajao — "Signal" interaction engine
   Lenis smooth scroll + GSAP/ScrollTrigger (word-stagger reveals, pinned
   horizontal timeline) + Three.js connected-node network + role rotator +
   cursor spotlight + magnetic buttons + orbit/line meters + slide-in panel
   ========================================================================== */
(() => {
    'use strict';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const hasGSAP = typeof window.gsap !== 'undefined';

    document.documentElement.classList.add('js');
    document.documentElement.classList.remove('no-js');

    if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    /* ---------------- Loader ---------------- */
    const loader = document.querySelector('.loader');
    const finishLoad = () => { loader?.classList.add('is-hidden'); document.body.classList.add('page-ready'); };
    window.addEventListener('load', () => window.setTimeout(finishLoad, 260));
    window.setTimeout(finishLoad, 2400);

    /* ---------------- Lenis ---------------- */
    if (!reduced && !coarse && typeof window.Lenis !== 'undefined') {
        const lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
        if (hasGSAP && window.ScrollTrigger) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }
    }

    /* ---------------- Cursor ---------------- */
    if (!coarse) {
        const dot = document.createElement('div'); dot.className = 'spot-dot';
        const ring = document.createElement('div'); ring.className = 'spot-ring';
        document.body.append(dot, ring);
        let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        });
        const loop = () => {
            rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
        const targets = 'a, button, .button, input, textarea, select, [data-magnetic], .bento-cell, .showcase-row, .cert-row, .contact-list a';
        document.addEventListener('mouseover', (e) => { if (e.target.closest(targets)) ring.classList.add('is-active'); });
        document.addEventListener('mouseout', (e) => { if (e.target.closest(targets)) ring.classList.remove('is-active'); });
    }

    /* ---------------- Spotlight glow on .field-glow panels ---------------- */
    document.querySelectorAll('.field-glow').forEach((panel) => {
        panel.addEventListener('pointermove', (e) => {
            const b = panel.getBoundingClientRect();
            panel.style.setProperty('--sx', `${e.clientX - b.left}px`);
            panel.style.setProperty('--sy', `${e.clientY - b.top}px`);
        });
    });

    /* ---------------- Magnetic buttons ---------------- */
    if (!coarse && !reduced) {
        document.querySelectorAll('[data-magnetic], .button').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const b = el.getBoundingClientRect();
                const relX = e.clientX - b.left - b.width / 2;
                const relY = e.clientY - b.top - b.height / 2;
                el.style.transform = `translate(${relX * 0.2}px, ${relY * 0.28}px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    }

    /* ---------------- 3D tilt on bento cells ---------------- */
    if (!coarse && !reduced) {
        document.querySelectorAll('.bento-cell').forEach((cell) => {
            cell.addEventListener('pointermove', (e) => {
                const b = cell.getBoundingClientRect();
                const px = (e.clientX - b.left) / b.width - 0.5;
                const py = (e.clientY - b.top) / b.height - 0.5;
                cell.style.setProperty('--tx', `${py * -4}deg`);
                cell.style.setProperty('--ty', `${px * 5}deg`);
            });
            cell.addEventListener('pointerleave', () => {
                cell.style.setProperty('--tx', '0deg');
                cell.style.setProperty('--ty', '0deg');
            });
        });
    }

    /* ---------------- Nav: scroll state + full-screen mobile menu ---------------- */
    const nav = document.querySelector('.nav');
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.append(progressBar);

    const onScroll = () => {
        nav?.classList.toggle('is-scrolled', window.scrollY > 24);
        const scrollable = document.documentElement.scrollHeight - innerHeight;
        const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
        progressBar.style.transform = `scaleX(${Math.min(pct, 1)})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const burger = document.querySelector('.burger');
    const navFull = document.querySelector('.nav-full');
    if (burger && navFull) {
        burger.addEventListener('click', () => {
            const open = navFull.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', String(open));
            document.body.style.overflow = open ? 'hidden' : '';
        });
        navFull.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
            navFull.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }));
    }

    /* ---------------- Scroll reveals ---------------- */
    const reveals = document.querySelectorAll('.reveal');
    if (hasGSAP && window.ScrollTrigger && !reduced) {
        reveals.forEach((el) => {
            const dir = el.dataset.reveal || 'up';
            const from = {
                up: { y: 40, opacity: 0 }, left: { x: -48, opacity: 0 },
                right: { x: 48, opacity: 0 }, scale: { scale: 0.94, opacity: 0 },
            }[dir] || { y: 40, opacity: 0 };
            gsap.fromTo(el, from, {
                y: 0, x: 0, scale: 1, opacity: 1, duration: 0.85, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            });
        });
    } else if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-static'); obs.unobserve(entry.target); } });
        }, { threshold: 0.15 });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('is-static'));
    }

    if (hasGSAP && window.ScrollTrigger && !reduced) {
        document.querySelectorAll('[data-stagger]').forEach((group) => {
            gsap.fromTo(group.children, { y: 28, opacity: 0 }, {
                y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.08,
                scrollTrigger: { trigger: group, start: 'top 88%', once: true },
            });
        });
    }

    /* ---------------- Word-stagger hero headline ---------------- */
    document.querySelectorAll('[data-split]').forEach((el) => {
        const words = el.textContent.trim().split(/\s+/);
        // A real space between wrappers gives the browser a valid line-break
        // opportunity so long headlines wrap normally instead of overflowing.
        el.innerHTML = words.map((w) => `<span class="line"><span>${w}</span></span>`).join(' ');
        if (hasGSAP && !reduced) {
            gsap.fromTo(el.querySelectorAll('.line > span'), { yPercent: 130, opacity: 0 }, {
                yPercent: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.05, delay: 0.15,
            });
        }
    });

    /* ---------------- Role rotator ---------------- */
    const rotator = document.querySelector('.role-rotator');
    if (rotator) {
        let roles = [];
        try { roles = JSON.parse(rotator.dataset.roles); } catch (e) { roles = []; }
        const track = document.createElement('div');
        track.className = 'role-track';
        roles.concat(roles[0]).forEach((r) => {
            const row = document.createElement('div');
            row.textContent = r;
            track.append(row);
        });
        rotator.innerHTML = '';
        rotator.append(track);
        if (!reduced && roles.length > 1) {
            let i = 0;
            window.setInterval(() => {
                i += 1;
                track.style.transform = `translateY(-${i * 2.4}em)`;
                if (i === roles.length) {
                    window.setTimeout(() => {
                        track.style.transition = 'none';
                        track.style.transform = 'translateY(0)';
                        i = 0;
                        requestAnimationFrame(() => { track.style.transition = ''; });
                    }, 900);
                }
            }, 2200);
        }
    }

    /* ---------------- Counters ---------------- */
    document.querySelectorAll('[data-counter]').forEach((el) => {
        if (!('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const target = parseFloat(el.dataset.counter);
                const suffix = el.dataset.suffix || '';
                const dur = reduced ? 0 : 1500;
                const start = performance.now();
                const step = (now) => {
                    const p = dur === 0 ? 1 : Math.min((now - start) / dur, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                obs.unobserve(el);
            });
        }, { threshold: 0.4 });
        io.observe(el);
    });

    /* ---------------- Line meters ---------------- */
    document.querySelectorAll('.meter-line i').forEach((bar) => {
        if (!('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) { entry.target.style.width = entry.target.dataset.width; obs.unobserve(entry.target); }
            });
        }, { threshold: 0.4 });
        io.observe(bar);
    });

    /* ---------------- Orbit diagram build ---------------- */
    document.querySelectorAll('[data-orbit]').forEach((orbit) => {
        let items = [];
        try { items = JSON.parse(orbit.dataset.orbit); } catch (e) { items = []; }
        const rings = [
            { radius: '50%', duration: 34 },
            { radius: '38%', duration: 26 },
            { radius: '24%', duration: 18 },
        ];
        items.forEach((item, i) => {
            const ring = rings[i % rings.length];
            const layer = document.createElement('div');
            layer.className = 'orbit-item';
            layer.style.animationDuration = `${ring.duration}s`;
            if (i % 2 === 1) layer.style.animationDirection = 'reverse';
            const span = document.createElement('span');
            span.innerHTML = `<i class="${item.icon}"></i>`;
            span.style.animationDuration = layer.style.animationDuration;
            span.style.animationDirection = layer.style.animationDirection || 'normal';
            layer.style.width = ring.radius === '50%' ? '100%' : ring.radius;
            layer.style.height = layer.style.width;
            layer.style.top = layer.style.left = `${(100 - parseFloat(ring.radius)) / 2}%`;
            layer.append(span);
            orbit.append(layer);
        });
    });

    /* ---------------- Pinned horizontal timeline (desktop) ---------------- */
    const timelinePin = document.querySelector('.timeline-pin');
    const timelineTrack = document.querySelector('.timeline-track');
    const timelineStack = document.querySelector('.timeline-stack');
    if (timelinePin && timelineTrack) {
        const isDesktop = window.matchMedia('(min-width: 861px)').matches;
        if (isDesktop && hasGSAP && window.ScrollTrigger && !reduced) {
            timelineTrack.style.display = 'flex';
            if (timelineStack) timelineStack.style.display = 'none';
            const setup = () => {
                const distance = timelineTrack.scrollWidth - timelinePin.clientWidth;
                if (distance <= 0) return null;
                return gsap.to(timelineTrack, {
                    x: -distance, ease: 'none',
                    scrollTrigger: {
                        trigger: timelinePin, start: 'top top', end: () => `+=${distance}`,
                        scrub: 0.6, pin: true, invalidateOnRefresh: true,
                    },
                });
            };
            window.setTimeout(setup, 200);
        } else {
            timelineTrack.style.display = 'none';
            if (timelineStack) timelineStack.style.display = 'flex';
        }
    }

    /* ---------------- Project parallax (showcase images) ---------------- */
    if (hasGSAP && window.ScrollTrigger && !reduced) {
        document.querySelectorAll('.showcase-media img').forEach((img) => {
            gsap.fromTo(img, { yPercent: -6 }, {
                yPercent: 6, ease: 'none',
                scrollTrigger: { trigger: img.closest('.showcase-media'), start: 'top bottom', end: 'bottom top', scrub: true },
            });
        });
    }

    /* ---------------- Slide-in project panel ---------------- */
    const overlay = document.querySelector('.panel-overlay');
    if (overlay) {
        const sheet = overlay.querySelector('.panel-sheet');
        const close = overlay.querySelector('.panel-close');
        const open = (trigger) => {
            const { panelTitle, panelDesc, panelImg, panelTags } = trigger.dataset;
            sheet.querySelector('img').src = panelImg || '';
            sheet.querySelector('h3').textContent = panelTitle || '';
            sheet.querySelector('p').textContent = panelDesc || '';
            const tagWrap = sheet.querySelector('.showcase-tags');
            if (tagWrap) {
                tagWrap.innerHTML = '';
                (panelTags || '').split(',').filter(Boolean).forEach((t) => {
                    const span = document.createElement('span');
                    span.textContent = t.trim();
                    tagWrap.append(span);
                });
            }
            overlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        };
        const doClose = () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; };
        document.querySelectorAll('[data-panel-trigger]').forEach((t) => t.addEventListener('click', (e) => { e.preventDefault(); open(t); }));
        close?.addEventListener('click', doClose);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) doClose(); });
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') doClose(); });
    }

    /* ---------------- Contact form floating labels + validation UX ---------------- */
    document.querySelectorAll('.line-field input, .line-field textarea').forEach((input) => {
        const field = input.closest('.line-field');
        const sync = () => field.classList.toggle('is-filled', input.value.trim().length > 0);
        input.addEventListener('input', () => { sync(); field.classList.remove('is-invalid'); });
        input.addEventListener('blur', () => { sync(); if (input.required && !input.value.trim()) field.classList.add('is-invalid'); });
        sync();
    });
    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', () => {
            form.querySelectorAll('.line-field').forEach((field) => {
                const input = field.querySelector('input, textarea');
                if (input?.required && !input.value.trim()) field.classList.add('is-invalid');
            });
        }, true);
    });

    /* ---------------- Internal link transition ---------------- */
    document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === '_blank') return;
            const dest = link.href;
            if (new URL(dest).origin !== location.origin || dest === location.href) return;
            e.preventDefault();
            document.body.classList.add('page-leaving');
            window.setTimeout(() => { location.href = dest; }, 180);
        });
    });

    /* ---------------- Three.js connected-node network (hero background) ---------------- */
    const canvas = document.querySelector('[data-network]');
    if (canvas && typeof window.THREE !== 'undefined' && !reduced && !coarse) {
        try {
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(58, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
            camera.position.z = 20;

            const count = 60;
            const nodes = [];
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i += 1) {
                const x = (Math.random() - 0.5) * 36;
                const y = (Math.random() - 0.5) * 20;
                const z = (Math.random() - 0.5) * 16;
                nodes.push(new THREE.Vector3(x, y, z));
                positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
            }
            const pointGeo = new THREE.BufferGeometry();
            pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const pointMat = new THREE.PointsMaterial({ color: 0x7c6cff, size: 0.11, transparent: true, opacity: 0.85 });
            scene.add(new THREE.Points(pointGeo, pointMat));

            const linePositions = [];
            const maxDist = 6.5;
            for (let i = 0; i < count; i += 1) {
                for (let j = i + 1; j < count; j += 1) {
                    if (nodes[i].distanceTo(nodes[j]) < maxDist) {
                        linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
                    }
                }
            }
            const lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
            const lineMat = new THREE.LineBasicMaterial({ color: 0x7c6cff, transparent: true, opacity: 0.12 });
            const lines = new THREE.LineSegments(lineGeo, lineMat);
            scene.add(lines);

            let tx = 0, ty = 0;
            window.addEventListener('mousemove', (e) => {
                tx = (e.clientX / innerWidth - 0.5) * 0.5;
                ty = (e.clientY / innerHeight - 0.5) * 0.5;
            });

            const resize = () => {
                renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            };
            resize();
            window.addEventListener('resize', resize);

            const animate = () => {
                scene.rotation.y += 0.0006;
                camera.position.x += (tx - camera.position.x) * 0.02;
                camera.position.y += (-ty - camera.position.y) * 0.02;
                camera.lookAt(scene.position);
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            };
            animate();
        } catch (err) {
            console.warn('Network background disabled:', err);
        }
    }
})();
