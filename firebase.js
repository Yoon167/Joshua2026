import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyAWVBvpT4z-DhzbTNEp0iGtEJqGBIE5pQc',
    authDomain: 'my-portfolio-e9346.firebaseapp.com',
    projectId: 'my-portfolio-e9346',
    storageBucket: 'my-portfolio-e9346.firebasestorage.app',
    messagingSenderId: '530588992290',
    appId: '1:530588992290:web:0e396b8c9add5a113f5b7b',
    measurementId: 'G-0WW47WSX58',
};

const OWNER_EMAIL = 'bajaojoshua2@gmail.com';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm && formMessage) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const defaultButtonLabel = submitButton.textContent;

    contactForm.addEventListener('submit', async (event) => {
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

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        formMessage.textContent = '';

        try {
            await addDoc(collection(db, 'inquiries'), {
                name,
                email,
                subject,
                message,
                status: 'new',
                source: 'portfolio',
                createdAt: serverTimestamp(),
            });

            contactForm.reset();
            formMessage.textContent = 'Thank you. Your message has been sent successfully.';
        } catch (error) {
            console.error('Unable to submit inquiry:', error);
            formMessage.textContent = 'Your message could not be sent right now. Please email me directly instead.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = defaultButtonLabel;
        }
    });
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
}[character]));

const formatInquiryDate = (createdAt) => {
    if (!createdAt?.toDate) {
        return 'Just received';
    }

    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(createdAt.toDate());
};

const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginMessage = document.getElementById('admin-login-message');
const adminLoginPanel = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const adminEmail = document.getElementById('admin-email');
const inquiryList = document.getElementById('inquiry-list');
const inquirySearch = document.getElementById('inquiry-search');
const inquiryFilter = document.getElementById('inquiry-filter');
const totalInquiryCount = document.getElementById('total-inquiry-count');
const newInquiryCount = document.getElementById('new-inquiry-count');
const resolvedInquiryCount = document.getElementById('resolved-inquiry-count');
const adminSignOut = document.getElementById('admin-sign-out');

let inquiries = [];
let stopInquiryListener = null;

const isOwner = (user) => user?.email?.toLowerCase() === OWNER_EMAIL;

const showDashboard = (user) => {
    adminLoginPanel?.setAttribute('hidden', '');
    adminDashboard?.removeAttribute('hidden');

    if (adminEmail) {
        adminEmail.textContent = user.email;
    }

    if (stopInquiryListener || !inquiryList) {
        return;
    }

    const inquiryQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    stopInquiryListener = onSnapshot(inquiryQuery, (snapshot) => {
        inquiries = snapshot.docs.map((snapshotDocument) => ({
            id: snapshotDocument.id,
            ...snapshotDocument.data(),
        }));
        renderInquiries();
    }, (error) => {
        console.error('Unable to load inquiries:', error);
        inquiryList.innerHTML = '<p class="admin-empty">Your dashboard is connected, but inquiries cannot be loaded yet. Check the deployed Firestore rules.</p>';
    });
};

const hideDashboard = () => {
    adminDashboard?.setAttribute('hidden', '');
    adminLoginPanel?.removeAttribute('hidden');
    inquiries = [];

    if (stopInquiryListener) {
        stopInquiryListener();
        stopInquiryListener = null;
    }
};

const renderInquiries = () => {
    if (!inquiryList) {
        return;
    }

    const searchTerm = inquirySearch?.value.trim().toLowerCase() || '';
    const selectedStatus = inquiryFilter?.value || 'all';
    const visibleInquiries = inquiries.filter((inquiry) => {
        const inquiryStatus = inquiry.status || 'new';
        const searchableText = `${inquiry.name} ${inquiry.email} ${inquiry.subject} ${inquiry.message}`.toLowerCase();

        return (selectedStatus === 'all' || inquiryStatus === selectedStatus) && searchableText.includes(searchTerm);
    });

    const newCount = inquiries.filter((inquiry) => (inquiry.status || 'new') === 'new').length;
    const resolvedCount = inquiries.filter((inquiry) => inquiry.status === 'resolved').length;

    if (totalInquiryCount) {
        totalInquiryCount.textContent = String(inquiries.length);
    }

    if (newInquiryCount) {
        newInquiryCount.textContent = String(newCount);
    }

    if (resolvedInquiryCount) {
        resolvedInquiryCount.textContent = String(resolvedCount);
    }

    if (visibleInquiries.length === 0) {
        inquiryList.innerHTML = '<p class="admin-empty">No messages match the current view.</p>';
        return;
    }

    inquiryList.innerHTML = visibleInquiries.map((inquiry) => {
        const status = inquiry.status || 'new';
        const subject = inquiry.subject || 'Portfolio inquiry';
        const replyUrl = `mailto:${encodeURIComponent(inquiry.email || '')}?subject=${encodeURIComponent(`Re: ${subject}`)}`;

        return `
            <article class="inquiry-card" data-inquiry-id="${inquiry.id}">
                <div class="inquiry-card-topline">
                    <span class="inquiry-status is-${escapeHtml(status)}">${escapeHtml(status)}</span>
                    <time>${escapeHtml(formatInquiryDate(inquiry.createdAt))}</time>
                </div>
                <h3>${escapeHtml(subject)}</h3>
                <p class="inquiry-sender">${escapeHtml(inquiry.name)} <a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></p>
                <p class="inquiry-message">${escapeHtml(inquiry.message)}</p>
                <div class="inquiry-actions">
                    <a class="button button-secondary" href="${escapeHtml(replyUrl)}">Reply by Email</a>
                    <button class="button button-ghost" type="button" data-inquiry-action="read">Mark Read</button>
                    <button class="button button-primary" type="button" data-inquiry-action="resolve">Resolve</button>
                    <button class="button button-danger" type="button" data-inquiry-action="delete">Delete</button>
                </div>
            </article>
        `;
    }).join('');
};

if (adminLoginForm && adminLoginMessage) {
    adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(adminLoginForm);
        const email = String(formData.get('email') || '').trim().toLowerCase();
        const password = String(formData.get('password') || '');
        const submitButton = adminLoginForm.querySelector('button[type="submit"]');

        if (email !== OWNER_EMAIL) {
            adminLoginMessage.textContent = 'This account is not authorized to access the owner console.';
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Signing in...';
        adminLoginMessage.textContent = '';

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Unable to sign in:', error);
            adminLoginMessage.textContent = 'Unable to sign in. Check your Firebase Authentication email and password.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In Securely';
        }
    });
}

if (adminSignOut) {
    adminSignOut.addEventListener('click', () => signOut(auth));
}

if (inquirySearch) {
    inquirySearch.addEventListener('input', renderInquiries);
}

if (inquiryFilter) {
    inquiryFilter.addEventListener('change', renderInquiries);
}

if (inquiryList) {
    inquiryList.addEventListener('click', async (event) => {
        const actionButton = event.target.closest('[data-inquiry-action]');

        if (!actionButton) {
            return;
        }

        const inquiryCard = actionButton.closest('[data-inquiry-id]');
        const inquiryId = inquiryCard?.dataset.inquiryId;

        if (!inquiryId) {
            return;
        }

        const action = actionButton.dataset.inquiryAction;
        actionButton.disabled = true;

        try {
            if (action === 'delete') {
                if (window.confirm('Delete this inquiry permanently?')) {
                    await deleteDoc(doc(db, 'inquiries', inquiryId));
                }
            } else {
                await updateDoc(doc(db, 'inquiries', inquiryId), {
                    status: action === 'resolve' ? 'resolved' : 'read',
                });
            }
        } catch (error) {
            console.error('Unable to update inquiry:', error);
            actionButton.disabled = false;
        }
    });
}

if (adminLoginPanel && adminDashboard) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            hideDashboard();
            return;
        }

        if (!isOwner(user)) {
            await signOut(auth);
            adminLoginMessage.textContent = 'This account is not authorized to access the owner console.';
            return;
        }

        showDashboard(user);
    });
}