/**
 * Convertly In-Browser Native Image Processing Pipeline Engine
 */

window.ConverterEngine = {
    async processFile(id) {
        const file = window.Convertly.state.queuedFiles.get(id);
        if (!file) return;

        const fillEl = document.getElementById(`progress-${id}`);
        const triggerBtn = document.querySelector(`.btn-convert-trigger[data-id="${id}"]`);

        if (triggerBtn) triggerBtn.disabled = true;

        try {
            this.simulateProgress(fillEl, 10, 40, 200);

            // Setup programmatic targeted format based on contextual view routing setup
            const targetFormat = this.determineTargetFormat();
            // Google Analytics Event - Conversion Started
            if (typeof gtag === "function") {
                gtag("event", "image_convert_start", {
                    tool_name: window.location.pathname.replace("/", "").replace(".html", ""),
                    file_name: file.name,
                    file_size: file.size
                });
            }
            const processedBlob = await this.executeCanvasTransformation(file, targetFormat);

            this.simulateProgress(fillEl, 45, 100, 100);

            setTimeout(() => {
                this.triggerNativeDownload(processedBlob, file.name, targetFormat);
                // Google Analytics Event - Conversion Success
                if (typeof gtag === "function") {
                    gtag("event", "image_convert_success", {
                        tool_name: window.location.pathname.replace("/", "").replace(".html", ""),
                        output_format: targetFormat
                    });
                }
                if (UI) UI.showToast(`Converted ${file.name} successfully!`);
                if (triggerBtn) {
                    triggerBtn.innerText = "Downloaded";
                    triggerBtn.style.background = "var(--success)";
                }
            }, 400);

        } catch (err) {
            console.error('Core transformation routine failed:', err);
            if (UI) UI.showToast('Transformation matrix error occurred.', 'error');
            if (triggerBtn) triggerBtn.disabled = false;
        }
    },

    determineTargetFormat() {
        const pathname = window.location.pathname;
        if (pathname.includes('webp-to-jpg')) return 'image/jpeg';
        if (pathname.includes('jpg-to-png')) return 'image/png';
        if (pathname.includes('png-to-jpg')) return 'image/jpeg';
        return 'image/jpeg'; // Safe fallback baseline defaults
    },

    executeCanvasTransformation(file, format) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    // Maintain standard transparency profiles if targeted output allows
                    if (format === 'image/jpeg') {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    ctx.drawImage(img, 0, 0);

                    // Canvas parameter variations can be adjusted through user options inputs
                    const quality = parseFloat(document.getElementById('config-quality')?.value) || 0.92;

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas compilation structure collapsed'));
                    }, format, quality);
                };
                img.onerror = () => reject(new Error('Image parser mapping failure'));
                img.src = event.target.result;
            };
            reader.onerror = () => reject(new Error('IO Reader exception thrown'));
            reader.readAsDataURL(file);
        });
    },

    simulateProgress(element, start, end, ms) {
        if (!element) return;
        let current = start;
        const interval = setInterval(() => {
            current += 5;
            element.style.width = `${current}%`;
            if (current >= end) clearInterval(interval);
        }, ms / ((end - start) / 5));
    },

    triggerNativeDownload(blob, originalName, mimeType) {
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_converted.${ext}`;
        document.body.appendChild(a);
        a.click();
        // Google Analytics Event - Image Download
        if (typeof gtag === "function") {
            gtag("event", "image_download", {
                tool_name: window.location.pathname.replace("/", "").replace(".html", ""),
                file_name: a.download,
                output_format: mimeType
            });
        }

        // Instant GC pipeline memory recovery optimization
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }
};