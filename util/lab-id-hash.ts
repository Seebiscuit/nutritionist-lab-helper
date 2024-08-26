interface LabResult {
    column: string;
    value: string;
}

export function generateLabId(patientId: number, collectedDate: string, results: LabResult[]): string {
    // Sort results to ensure consistent hashing
    const sortedResults = results.sort((a, b) => a.column.localeCompare(b.column));

    // Create the string to be hashed
    const hashString = `${patientId}${collectedDate}${sortedResults.map(r => `${r.column}:${r.value}`).join('')}`;

    // Generate base64 hash
    return Buffer.from(hashString).toString('base64');
}   