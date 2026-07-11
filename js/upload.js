/**
 * Convertly High Performance File Stream Ingest Engine
 */

class FileUploader {
    constructor(dropzoneId, fileInputId, options = {}) {
        this.dropzone = document.getElementById(dropzoneId);
        this.input = document.getElementById(fileInputId);
        this.options = Object.assign({ allowedTypes: [], multiple: true }, options);

        if (this.dropzone && this.input) this.init();
    }

    init() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropzone.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropzone.addEventListener(eventName, () => this.dropzone.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropzone.addEventListener(eventName, () => this.dropzone.classList.remove('drag-over'), false);
        });

        this.dropzone.addEventListener('drop', e => this.handleFiles(e.dataTransfer.files));
        this.input.addEventListener('change', e => this.handleFiles(e.target.files));
    }

    handleFiles(files) {
        const fileArray = Array.from(files);
        fileArray.forEach(file => {
            const uniqueId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
            this.renderQueueItem(file, uniqueId);

            // Push to application local memory registry without structural mutability leaks
            window.Convertly.state.queuedFiles.set(uniqueId, file);
            // Google Analytics Event - Image Upload
            if (typeof gtag === "function") {
                gtag("event", "image_upload", {
                    tool_name: window.location.pathname.replace("/", "").replace(".html", ""),
                    file_name: file.name,
                    file_type: file.type,
                    file_size: file.size
                });
            }
        });
    }

    renderQueueItem(file, id) {
        const container = document.getElementById('conversionQueue');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'queue-item';
        el.id = `queue-item-${id}`;

        const readableSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

        el.innerHTML = `
            <div class="queue-file-info">
                <div class="queue-meta">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-size">${readableSize}</div>
                </div>
            </div>
            <div class="queue-controls">
                <div class="progress-bar-wrapper">
                    <div class="progress-bar-fill" id="progress-${id}"></div>
                </div>
                <button class="btn btn-primary btn-sm btn-convert-trigger" data-id="${id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Convert</button>
            </div>
        `;

        container.appendChild(el);

        // Instantly attach processing listeners to action triggers natively
        el.querySelector('.btn-convert-trigger').addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-id');
            window.ConverterEngine.processFile(targetId);
        });
    }
}