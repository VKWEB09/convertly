/**
 * Convertly Core Application Engine
 * Pure Vanilla State Management Architecture
 */

window.Convertly = {
    state: {
        theme: 'light',
        activeTool: 'home',
        queuedFiles: new Map()
    },

    init() {
        this.initTheme();
        this.bindGlobalEvents();
        console.log('Convertly Framework Initialized Successfully.');
    },

    initTheme() {
        const savedTheme = localStorage.getItem('convertly-theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        this.setTheme(savedTheme);
    },

    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('convertly-theme', theme);

        // Dispatch custom global event for contextual canvas resets if applicable
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    },

    bindGlobalEvents() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const nextTheme = this.state.theme === 'light' ? 'dark' : 'light';
                this.setTheme(nextTheme);
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => window.Convertly.init());