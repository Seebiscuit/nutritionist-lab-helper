export function fuzzySearch<T>(items: T[], query: string, keys: (keyof T)[]): T[] {
    const lowercaseQuery = query.toLowerCase();
    return items.filter((item) =>
        keys.some((key) =>
            String(item[key]).toLowerCase().includes(lowercaseQuery)
        )
    );
}