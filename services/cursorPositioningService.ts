function getCursorCoordinates(textareaElement: HTMLTextAreaElement | HTMLInputElement): { top: number; left: number; } {
    const cursorIndex = getCursorIndex(textareaElement);
    const tempElement = createTempElement(textareaElement);
    const cursorSpan = addCursorSpan(tempElement, textareaElement, cursorIndex);
    const wrapper = createWrapper(tempElement);

    document.body.appendChild(wrapper);

    const { left: cursorLeft, top: cursorTop } = getCursorPosition(cursorSpan);

    document.body.removeChild(wrapper);

    return calculateFinalPosition(textareaElement, cursorLeft, cursorTop);
}

function getCursorIndex(element: HTMLTextAreaElement | HTMLInputElement): number {
    return element.selectionStart ?? 0;
}

function createTempElement(textareaElement: HTMLTextAreaElement | HTMLInputElement): HTMLDivElement {
    const temp = document.createElement('div');
    setTempElementStyles(temp, textareaElement);
    return temp;
}

function setTempElementStyles(element: HTMLDivElement, textareaElement: HTMLTextAreaElement | HTMLInputElement): void {
    const styles = getComputedStyle(textareaElement);
    Object.assign(element.style, {
        position: 'absolute',
        visibility: 'hidden',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        overflow: 'hidden',
        width: styles.width,
        height: styles.height,
        font: styles.font,
        lineHeight: styles.lineHeight,
        padding: styles.padding,
        border: styles.border,
        boxSizing: styles.boxSizing
    });
}

function addCursorSpan(tempElement: HTMLDivElement, textareaElement: HTMLTextAreaElement | HTMLInputElement, cursorIndex: number): HTMLSpanElement {
    const textBeforeCursor = textareaElement.value.substring(0, cursorIndex);
    tempElement.textContent = textBeforeCursor;

    const cursorSpan = document.createElement('span');
    cursorSpan.textContent = '|';
    tempElement.appendChild(cursorSpan);

    return cursorSpan;
}

function createWrapper(tempElement: HTMLDivElement): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.appendChild(tempElement);
    return wrapper;
}

function getCursorPosition(cursorSpan: HTMLSpanElement): { left: number; top: number; } {
    return {
        left: cursorSpan.offsetLeft,
        top: cursorSpan.offsetTop
    };
}

function calculateFinalPosition(textareaElement: HTMLTextAreaElement | HTMLInputElement, cursorLeft: number, cursorTop: number): { left: number; top: number; } {
    const textareaRect = textareaElement.getBoundingClientRect();
    const adjustedLeft = textareaRect.left + cursorLeft - textareaElement.scrollLeft;
    const adjustedTop = textareaRect.top + cursorTop - textareaElement.scrollTop;

    //logPositionDetails(textareaElement, cursorLeft, cursorTop, textareaRect, adjustedLeft, adjustedTop);

    return { left: adjustedLeft, top: adjustedTop };
}

function logPositionDetails(
    textareaElement: HTMLTextAreaElement | HTMLInputElement,
    cursorLeft: number,
    cursorTop: number,
    textareaRect: DOMRect,
    adjustedLeft: number,
    adjustedTop: number
): void {
    console.log(
        "\nleft", cursorLeft,
        "\ntextareaLeft", textareaRect.left,
        "\ntextareaElement.scrollLeft", textareaElement.scrollLeft,
        "\ntop", cursorTop,
        "\ntextareaTop", textareaRect.top,
        "\ntextareaElement.scrollTop", textareaElement.scrollTop,
        "\nadjustedLeft", adjustedLeft,
        "\nadjustedTop", adjustedTop,
    );
}

export const cursorPositioningService = {
    getCursorCoordinates
};