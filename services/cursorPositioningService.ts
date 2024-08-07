export const cursorPositioningService = {
    getCursorCoordinates(element: HTMLTextAreaElement | HTMLInputElement): { top: number; left: number; } {
        const { selectionStart, selectionEnd } = element;
        const text = element.value.substring(0, selectionEnd ?? 0);
        const textBeforeCursor = element.value.substring(0, selectionStart ?? 0);

        const span = document.createElement('span');
        span.style.font = window.getComputedStyle(element).font;
        span.style.whiteSpace = 'pre-wrap';
        span.textContent = text;

        const measurementDiv = document.createElement('div');
        measurementDiv.style.position = 'absolute';
        measurementDiv.style.visibility = 'hidden';
        measurementDiv.style.width = `${element.offsetWidth}px`;
        measurementDiv.appendChild(span);

        document.body.appendChild(measurementDiv);

        const { offsetWidth, offsetHeight } = span;
        const lineHeight = parseInt(window.getComputedStyle(element).lineHeight, 10);
        const lines = textBeforeCursor.split('\n');

        document.body.removeChild(measurementDiv);

        const rect = element.getBoundingClientRect();
        const scrollTop = element.scrollTop;
        const scrollLeft = element.scrollLeft;

        const top = rect.top + lines.length * lineHeight - scrollTop;
        const left = rect.left + (offsetWidth % rect.width) - scrollLeft;

        return { top, left };
    }
};