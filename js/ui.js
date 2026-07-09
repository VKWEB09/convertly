/**
 * Convertly UI Interaction & Orchestration Layer
 */

const UI = {
    init() {
        this.setupFAQs();
    },

    setupFAQs() {
        const triggers = document.querySelectorAll('.faq-trigger');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const item = trigger.closest('.faq-item');
                const content = item.querySelector('.faq-content');
                const isOpen = item.classList.contains('active');

                // Dynamic smooth calculation max-height assignment
                if (isOpen) {
                    content.style.maxHeight = null;
                    item.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                    item.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: var(--cards);
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : 'var(--primary)'};
            box-shadow: var(--shadow-lg);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-sm);
            margin-bottom: 0.5rem;
            animation: slideUp 0.2s ease forwards;
            font-size: 0.875rem;
            font-weight: 500;
        `;
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column;';
        document.body.appendChild(container);
        return container;
    }
};

document.addEventListener('DOMContentLoaded', () => UI.init());