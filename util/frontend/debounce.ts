const DEFAULT_DEBOUNCE_DELAY = 300;

export function debounce(func: Function, delay: number = DEFAULT_DEBOUNCE_DELAY): Function {
    let timeoutId: NodeJS.Timeout;

    return function (...args: any[]) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(func, args);
        }, delay);
    };
}