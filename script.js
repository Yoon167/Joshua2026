const navToggle = document.querySelector('.nav-toggle');
const navPanel = document.querySelector('.nav-panel');
const navLinks = document.querySelectorAll('.nav-link');

document.documentElement.classList.add('js');
requestAnimationFrame(() => document.body.classList.add('page-ready'));

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

const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18,
    });

    reveals.forEach((item) => revealObserver.observe(item));
} else {
    reveals.forEach((item) => item.classList.add('is-visible'));
}

const progressBars = document.querySelectorAll('.progress-track span');

if ('IntersectionObserver' in window && progressBars.length > 0) {
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

const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
scrollIndicator.setAttribute('aria-hidden', 'true');
document.body.append(scrollIndicator);

const updateScrollIndicator = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    scrollIndicator.style.transform = `scaleX(${Math.min(progress, 100) / 100})`;
};

window.addEventListener('scroll', updateScrollIndicator, { passive: true });
updateScrollIndicator();

const heroCard = document.querySelector('.hero-card');

if (heroCard && window.matchMedia('(hover: hover) and (min-width: 1025px)').matches) {
    heroCard.addEventListener('pointermove', (event) => {
        const bounds = heroCard.getBoundingClientRect();
        const horizontalPosition = (event.clientX - bounds.left) / bounds.width - 0.5;
        const verticalPosition = (event.clientY - bounds.top) / bounds.height - 0.5;

        heroCard.style.setProperty('--tilt-x', `${verticalPosition * -3}deg`);
        heroCard.style.setProperty('--tilt-y', `${horizontalPosition * 4}deg`);
    });

    heroCard.addEventListener('pointerleave', () => {
        heroCard.style.setProperty('--tilt-x', '0deg');
        heroCard.style.setProperty('--tilt-y', '0deg');
    });
}

const internalLinks = document.querySelectorAll('a[href$=".html"], a[href*=".html#"]');

internalLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') {
            return;
        }

        const destination = link.href;

        if (new URL(destination).origin !== window.location.origin || destination === window.location.href) {
            return;
        }

        event.preventDefault();
        document.body.classList.add('page-leaving');
        window.setTimeout(() => {
            window.location.href = destination;
        }, 220);
    });
});

const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm && formMessage) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const subject = String(formData.get('subject') || '').trim();
        const message = String(formData.get('message') || '').trim();

        if (!name || !email || !subject || !message) {
            formMessage.textContent = 'Please complete every field before sending.';
            return;
        }

        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            '',
            message,
        ].join('\n');

        const mailtoLink = `mailto:bajaojoshua2@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        formMessage.textContent = 'Your email app should open with this message ready to send.';
    });
}
